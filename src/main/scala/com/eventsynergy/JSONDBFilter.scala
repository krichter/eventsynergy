package com.eventsynergy

import java.net.URL
import java.util.{UUID,Date,TimeZone,Properties}
import java.text.{SimpleDateFormat,NumberFormat}
import collection.JavaConversions._;
import org.scalatra.{ScalatraFilter,ScalatraServlet};
import collection.mutable._;
import xml.NodeSeq;
//import util.matching._;
import util.parsing.json._;
import org.scalatra.fileupload.FileUploadSupport
//import javax.mail._;
//import javax.mail.internet._;
import java.util.logging.Logger;
import java.text.DateFormat;
import java.util.Date;
import scala.language.implicitConversions

import freemarker.template._;

import com.google.appengine.api.users.{UserService,UserServiceFactory}
import com.google.appengine.api.channel.{ChannelServiceFactory,ChannelMessage}
import com.google.appengine.api.datastore.{DatastoreService,DatastoreServiceFactory,Entity,Query,PreparedQuery,Key,KeyFactory,FetchOptions,Transaction,TransactionOptions}
import com.google.appengine.api.datastore.FetchOptions.Builder._
import com.google.appengine.api.memcache.{MemcacheServiceFactory,MemcacheService,Expiration}
import com.google.appengine.api.taskqueue.{Queue,QueueFactory}
import com.google.appengine.api.taskqueue.TaskOptions.Builder._;
//import com.google.appengine.api.images._;

import org.mozilla.javascript._;

/**
 * This in a class built on the Scalatra framework
 */
class JSONDBFilter extends ScalatraFilter with FileUploadSupport {
	var log = Logger.getLogger(this.getClass.getName());
	var userService = UserServiceFactory.getUserService();
	//var datastore = DatastoreServiceFactory.getDatastoreService();
	var memcacheservice = MemcacheServiceFactory.getMemcacheService();
	var channelService = ChannelServiceFactory.getChannelService();
	implicit def object2PropertyValue(o: Object):PropertyValue = new PropertyValue(o);
	implicit def entity2CustomEntity(e: Entity):CustomEntity = new CustomEntity(e);
	case class Event(id:String,title:String);
	

	// Freemarker template handling setup
	var templatecfg = new Configuration();
		
	// Set some defaults
	val presencetimeout = 300;
	val backupjsondbeveryxtransactions = 25;
	val transactionlistbatch = 100;
	
	/**
	 * GET call to forward the javascript transactions document through to client browser.
	 * 
	 * Needs to be in classpath as this file is also loaded server-side for transaction processing
	 */
	get("/jsondb/transactions") {
		response.setContentType("application/javascript")
		io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/transactions.js")).mkString
	}

	/**
	 * GET call to forward the javascript dbutil document through to client browser
	 * 
	 * Needs to be in classpath as this file is also loaded server-side for transaction processing
	 */
	get("/jsondb/dbutils") {
		response.setContentType("application/javascript")
		io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/jsondbutils.js")).mkString
	}

	/**
	 * REST call to create a new event.
	 * 
	 * @param title - Event title
	 */
	post("/manage/createevent") {
		var param_title = params.get("title").getOrElse(null);
		if (param_title != null && param_title.size > 0) {
			var id = Utils.getUUID()
			var datastore = DatastoreServiceFactory.getDatastoreService()
			var e = new Entity("event",id);
			e.setProperty("title",param_title)
			e.setProperty("id",id)
			datastore.put(e);
		}
		redirect("/manage/");
	}
	
	/**
	 * POST call to add user to allowed users list.
	 */
	post("/manage/adduser") {
		memcacheservice.delete("allaccess")
		var param_email = params.get("email").getOrElse(null);
		if (param_email != null) {
			var datastore = DatastoreServiceFactory.getDatastoreService()
			var e = new Entity("alloweduser",param_email); 
			e.setProperty("email",param_email)
			datastore.put(e);
		}
		redirect("/manage/");
	}
	
	/**
	 * Call to remove a user from the allowed users list
	 */
	get("/manage/removeuser") {
		var param_email = params.get("email").getOrElse(null);
		if (userService.getCurrentUser().getEmail().toLowerCase != param_email) {
			var datastore = DatastoreServiceFactory.getDatastoreService();
			try {
				datastore.delete(KeyFactory.createKey("alloweduser",param_email))
			} catch {
				case e:Throwable => printerror(e)
			}
			memcacheservice.delete("access_"+param_email)
		}
		redirect("/manage/");
	}
	
	/**
	 * Launch point for an application instance.
	 * 
	 * - Instanciates a channel for the particular client instance to listen on for DB updates
	 * 
	 * Note: GAE claims the channel creation is expensive in the dashboard. Will need to keep an eye on this
	 * 
	 * @param id - Needs the event/db id, otherwise redirects back
	 */
	get("/manage/event2") {
		var eventid = params.get("id").getOrElse(null);
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		try {
			if (memcacheservice.get("restoreinprogress_"+eventid) != null) {
				"This event is currently not available due to DB restore in progress..."
			} else {
				
				var ekey = KeyFactory.createKey("event",eventid);
				var datastore = DatastoreServiceFactory.getDatastoreService();
				var e = datastore.get(ekey);
				
				// ----------------------------------------------------------------------------------------------
				// Start of channel support code.
				//
				// Logic based on pinging a known spot in the memcache service. If it times out, you are now offline
				// Sets up unique channel for this manage instance
				// Keeps a list of "live" clients in memcached for an event that will want to get updates
				// ----------------------------------------------------------------------------------------------
				var clientid = Utils.getUUID()
				memcacheservice.put(eventid+"_"+clientid,1,Expiration.byDeltaSeconds(presencetimeout))
				
				var lockresult = Utils.getLockOrWait(eventid+"_channelreg")
				var regresult = memcacheservice.get(eventid+"_reg")
				var toput = "";
				if (regresult == null) {
					toput = clientid
				} else {
					toput = regresult+","+clientid
				}
				memcacheservice.put(eventid+"_reg",toput);
				if (lockresult == 1) {
					Utils.releaseLock(eventid+"_channelreg")
				}
				
				var channeltoken = channelService.createChannel(clientid);

				// Freemarker template processing
				var m = new java.util.HashMap[String,Any]();
				m.put("channeltoken",channeltoken);
				m.put("eventid",eventid);
				m.put("clientid",clientid);
				templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
				var t = templatecfg.getTemplate("event2.ftl")
				t.process(m,response.getWriter)
			}
		} catch {
			// Probably will never be seen due to eventid check earlier
			case error:com.google.appengine.api.datastore.EntityNotFoundException => {
				// Event object wasn't found, redirect out	
				redirect("/manage/");
			}
			case e2:Throwable => {
				printerror(e2)
				halt();
			}
		}
		/*
		} else {
			redirect("/manage/");
		}*/
	}
	
	/**
	 * DB catchup system. The client will poll this endpoint every x seconds in order to look for
	 * unseen transactions to force the local system to be up to date. The inputs are the
	 * dbid, localtopid (what the client has as top transaction id), and clientid (for some presence stuff)
	 */
	get("/jsondb/catchup") {
		response.setContentType("application/json")
		var dbid = params.get("dbid").getOrElse(null);
		if (!Utils.eventidExists(dbid)) {
			halt(404);
		}
		var lastclienttransactionid = params.get("localtopid").getOrElse(0).toString().toFloat.toInt
		var clientid = params.get("clientid").getOrElse(null);
		
		// "Presence" renewal. Need to add code to check the presence list, not just this item.
		if (clientid == null){
			println("Client ID is null, there is a problem");
		} else {
			memcacheservice.put(dbid+"_"+clientid,1,Expiration.byDeltaSeconds(presencetimeout))
		}
		
		var topid = getTopTransactionId(dbid);
		if (lastclienttransactionid > topid) {
			// If the client has a higher transaction id, something is wrong, and force a complete reload of client	
			"{\"success\":true,\"dbreload\":true,\"lastclient\":"+lastclienttransactionid+",\"servertop\":"+topid+"}"
		} else {
			var tlist = Utils.getTransactionList(dbid,lastclienttransactionid,0,0,true).map(t => {
				"{\"tid\":"+t.id+",\"t\":"+t.json+"}";
			});
		
			"{\"success\":true,\"dbreload\":false,\"transactions\":["+tlist.mkString(",")+"]}"
		}
	}
	
	/**
	 * Endpoint for client browser to get the entire json document of the "db"
	 * Input is the dbid
	 */
	get("/jsondb/get") {
		response.setContentType("application/json")
		var dbid = params.get("dbid").getOrElse(null);
		if (!Utils.eventidExists(dbid)) {
			halt(404);
		}
		var data = Utils.getdb(dbid)

		"""{"success":true,"topid":"""+data._2+""","db":"""+data._1+"""}"""
	}
	
	/**
	 * Endpoint to handle transactions.
	 * Inputs:
	 * 		dbid - DB/Event id
	 * 		clientid - Client id to handle who NOT to broadcast to
	 * 		transaction - Transaction JSON
	 * 		localtransactionid - Local ID from the transaction to return (for async handling)
	 * 
	 */
	//post("/jsondb/t") {
	post("""^\/jsondb/(|internal)t""".r) {
		var dbid = params.get("dbid").getOrElse(null);
		var clientid = params.get("clientid").getOrElse(null);
		var transaction = params.get("transaction").getOrElse(null);
		var localtransactionid = params.get("localtransactionid").getOrElse(null);
		
		if (!Utils.eventidExists(dbid)) {
			halt(404);
		}
		var toreturn = "";
		var sid = addtransaction(dbid,transaction,false)
		broadcast(dbid:String,"""{"type":"transaction","sid":""""+sid+"""","t":"""+transaction+"""}""",clientid);
		toreturn = """{"success":true,"error":"","sid":""""+sid+"""","localtransactionid":""""+localtransactionid+""""}"""
		if (toreturn == "") {
			"""{"success":false,"error":"Transaction error","t":""""+transaction+""""}"""	
		} else {
			toreturn
		}
	}

	/**
	 * Simple call for browser to download the db as json
	 */
	get("/jsondb/backup") {
		var dbid = params.getOrElse("dbid",null);
		if (dbid == null || !Utils.eventidExists(dbid)) {
			halt(404);
		}
		response.setContentType("application/json")
		Utils.getdb(dbid)._1
	}
	
	get("/jsondb/recover") {
		var dbid = params.getOrElse("dbid",null);
		var sid = params.getOrElse("sid","0");
		if (dbid == null || !Utils.eventidExists(dbid)) {
			halt(404);
		}
		response.setContentType("application/json")
		var jsondb:String = null;
		try {
			var t = Utils.getTransaction(dbid,sid.toLong)
			
			if (t != null) {
				jsondb = Utils.getdb(t.entity)._1
			}
		} catch {
			case e:Throwable => printerror(e)
		}

		jsondb
	}

	/**
	 * Return the top known transactionid on server. This is gotten from the events entity, NOT calculated based
	 * on the actual transaction list for performance.
	 */
	def getTopTransactionId(dbid:String):Long = {
		var ekey = KeyFactory.createKey("event",dbid);
		var datastore = DatastoreServiceFactory.getDatastoreService();
		var e = datastore.get(ekey);
		//var rawtid = e.getProperty("tid");
		var rawtid = e.getProperty("toptid");
		if (rawtid != null) {
			return rawtid.asInstanceOf[Long];
		} else {
			var tid = e.getProperty("tid");
			if (tid != null) {
				return tid.asInstanceOf[Long];
			} else {
				return Utils.startval - 1;	
			}
		}
	}
	
	/**
	 * Creates a new channel if requested by client for a specific event. This is to handle client disconnects (they need a new channel)
	 * 
	 * Returns the data in JSON
	 * 
	 * @param dbid = DBID/Event ID
	 */
	get("/jsondb/channelreconnect") {
		response.setContentType("application/json")
		var eventid = params.get("dbid").getOrElse(null);
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		
		var clientid = Utils.getUUID()
		memcacheservice.put(eventid+"_"+clientid,1,Expiration.byDeltaSeconds(presencetimeout))
		
		var lockresult = Utils.getLockOrWait(eventid+"_channelreg")
		var regresult = memcacheservice.get(eventid+"_reg")
		var toput = "";
		if (regresult == null) {
			toput = clientid
		} else {
			toput = regresult+","+clientid
		}
		memcacheservice.put(eventid+"_reg",toput);
		if (lockresult == 1) {
			Utils.releaseLock(eventid+"_channelreg")
		}
		
		var channeltoken = channelService.createChannel(clientid);
		
		"{\"success\":true,\"channeltoken\":\""+channeltoken+"\",\"clientid\":\""+clientid+"\"}"
	}
	
	get("/manage/tlist") {
		var dbid = params.get("dbid").getOrElse(null);
		
		var tlist = Utils.getTransactionList(dbid,0,0,transactionlistbatch,false);
		
		var m = new java.util.HashMap[String,Any]();
		m.put("tlist",tlist.toArray)
		m.put("dbid",dbid)
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		var t = templatecfg.getTemplate("transactionlist.ftl")
		t.process(m,response.getWriter)
	}
	
	var stampformat = new SimpleDateFormat("MM/dd/yy K:m:s a z");
	stampformat.setTimeZone(TimeZone.getTimeZone("America/Vancouver"))
	get("/manage/tlist_more") {
		var dbid = params.get("dbid").getOrElse(null);
		var toval = params.get("toval").getOrElse(0).toString.toInt;
		var fromval = params.get("fromval").getOrElse(0).toString.toInt;
		
		var tlist = Utils.getTransactionList(dbid,fromval,toval-1,transactionlistbatch,false).map(t => {
			var backupval = "false";
			if (t.containsbackup) {
				backupval = "true";
			}
			var stamp = new StringBuilder( stampformat.format( t.datestamp ) )
			"""{"tid":"""+t.id+""","t":"""+t.json+""","who":""""+t.who+"""","isbackup":"""+backupval+""","stamp":""""+stamp+""""}""";
		});
		response.setContentType("application/json")
		
		"{\"success\":true,\"tlist\":["+tlist.mkString(",")+"]}"
	}
	
	/**
	 * This allows the user to replace the json db with a new json document
	 */
	post("/manage/restoredb") {
		//println("Handling restore...");
		
		var filedata = this.fileParams("dbfile");
		var dbid = params.getOrElse("dbid",null)
		if (!Utils.eventidExists(dbid)) {
			halt(404);
		}
		// TODO: Should confirm that the updated data is actually JSON.
		var oldtop = getTopTransactionId(dbid);
		var olddb = Utils.getdb(dbid);
		
		var jsondata = filedata.data
		var newid = addtransaction(dbid,"""{"action":"restoredb","params":{}}""",true)
		var newdb = Utils.b2s(jsondata);
		Utils.savedb(dbid,newdb,newid,false)
		
		Utils.commit(() => {
			var datastore = DatastoreServiceFactory.getDatastoreService()
			var txn = datastore.beginTransaction();
			try {
				var restoret = Utils.getTransaction(dbid,newid)
				Utils.savedb(datastore,txn,restoret.entity,newdb,true)	
				txn.commit()
			} finally {
				if (txn.isActive()) {
					txn.rollback()
				}
			}
		},10);
		
		var queue = QueueFactory.getDefaultQueue();
		queue.add(withUrl("/jsondb/consolidate").param("dbid",dbid).param("dbsid",olddb._2.toString()).param("toid",oldtop.toString()))
		redirect("/manage/");
	}
	
	/**
	 * Translate the backup file for campsynergy to campsynergy3
	 */
	post("/manage/translatebackup") {
		var filedata = this.fileParams("dbfile");
		var originaljson = Utils.b2s(filedata.data);
		var newjson:String = null;
		
		var cx = Context.enter();
		cx.setOptimizationLevel(-1);
		try {
			var scope = cx.initStandardObjects();
			var script = io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/transactions.js")).mkString;
			var utilscript = io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/jsondbutils.js")).mkString;
			var translation = io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/translation.js")).mkString;

			cx.evaluateString(scope,utilscript,"util",0,null);
			cx.evaluateString(scope,script,"transactions",0,null);
			cx.evaluateString(scope,translation,"translation",0,null);
			cx.evaluateString(scope,"var olddb = "+originaljson+";","internal",0,null);
			cx.evaluateString(scope,"var jsondbasstring = JSON.stringify(JSONDB_translate(olddb));","internal",0,null);
			//cx.evaluateString(scope,"java.lang.System.out.println(jsondbasstring);","internal",0,null);
			var result = scope.get("jsondbasstring", scope);
			if (result == Scriptable.NOT_FOUND) {
				println("Failure");
			} else {
				newjson = Context.toString(result);
			}
		} catch {
			case e:Throwable => e.printStackTrace()
		} finally {
			Context.exit();
		}
		response.setContentType("application/json")
		newjson
	}
	
	/**
	 * Handling the template with the primary management list
	 */
	get("/manage/?") {
		var userlist = new ListBuffer[String]();
		var eventlist = new ListBuffer[Event]();
		
		var q = new Query("alloweduser")
		q.addSort("email",Query.SortDirection.ASCENDING)
		var datastore = DatastoreServiceFactory.getDatastoreService();
		datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
			userlist += r.getProperty("email").toString
		})
		
		var q2 = new Query("event")
		q2.addSort("title",Query.SortDirection.ASCENDING)
		datastore.prepare(q2).asList(FetchOptions.Builder.withDefaults).foreach(r => {
			eventlist += Event(r.getProperty("id").toString,r.getProperty("title").toString)
		})
		
		var m = new java.util.HashMap[String,Any]();
		//m.put("bloburl",blobstoreService.createUploadUrl("/db/restore"))
		m.put("userlist",userlist.toArray)
		m.put("eventlist",eventlist.toArray)
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		var t = templatecfg.getTemplate("manage.ftl")
		t.process(m,response.getWriter)
	}
	
//	get("/manage") {
//		redirect("/manage/");
//	}
		
	get("/manage/*") {
		println("/manage/ Access: "+userService.getCurrentUser().getEmail())
		if (Utils.userallowed(userService.getCurrentUser().getEmail().toLowerCase())) {
			pass();
		} else {
			halt(403,userService.getCurrentUser().getEmail());
		}
	}
	
	post("/manage/*") {
		println("/manage/ Access: "+userService.getCurrentUser().getEmail())
		if (Utils.userallowed(userService.getCurrentUser().getEmail().toLowerCase())) {
			pass();
		} else {
			halt(403,userService.getCurrentUser().getEmail());
		}
	}
	
	
	get("/jsondb/image") {
		var imageid = params.getOrElse("imageid",null)
		var size = params.getOrElse("size","large")
		
		if (imageid != null) {
			try {
				var datastore = DatastoreServiceFactory.getDatastoreService();
				var imageentity = datastore.get(KeyFactory.createKey("imagestore",imageid));
				response.setContentType("image/jpeg")
				if (size == "large") {
					//println("Large size")
					imageentity.getProperty("largethumb").asInstanceOf[com.google.appengine.api.datastore.Blob].getBytes
				} else {
					//println("Small size")
					imageentity.getProperty("smallthumb").asInstanceOf[com.google.appengine.api.datastore.Blob].getBytes
				}
			} catch {
				case e:Throwable => halt(404);
			}
			
		}
	}
	
	post("/jsondb/consolidate") {
		// Need to add security here to check that this is being executed from a task, NOT locally
		var dbid = params.getOrElse("dbid",null)
		var dbsid = params.getOrElse("dbsid",0).toString().toInt
		var toid = params.getOrElse("toid",0).toString().toInt
//		log.info(dbid);
//		log.info(dbsid.toString);
//		log.info(toid.toString);
//		log.info("Consolidation: "+dbid)
		var startstamp = System.currentTimeMillis();
		
		if (dbid != null) {
			try {
				var jsondb:(String,Long) = null;
				var fromid:Int = 0;
				if (dbsid > 0) {
					var t = Utils.getTransaction(dbid,dbsid)
					jsondb = Utils.getdb(t.entity)
					fromid = dbsid;
				} else {
					jsondb = Utils.getdb(dbid);
					fromid = jsondb._2.toInt
				}
				
				var tlist = Utils.getTransactionList(dbid,fromid,toid,0,true);
				//log.info(tlist.size.toString)
				if (tlist.size == 0) {
					//var t = Utils.getTransaction(dbid,jsondb._2)
					//Utils.savedb(t.entity,jsondb._1,false)
				} else {
					var cx = Context.enter();
					cx.setOptimizationLevel(-1);
					try {
						var scope = cx.initStandardObjects();
						var script = io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/transactions.js")).mkString;
						var utilscript = io.Source.fromInputStream(servletContext.getResourceAsStream("/WEB-INF/jsondb/jsondbutils.js")).mkString;
			
						cx.evaluateString(scope,utilscript,"util",0,null);
						cx.evaluateString(scope,script,"transactions",0,null);
			
						cx.evaluateString(scope,"var JSONDB = {};","internal",0,null);
						
						cx.evaluateString(scope,"JSONDB.jsondb = "+jsondb._1+";","internal",0,null);
						//cx.evaluateString(scope,"java.lang.System.out.println(JSON.stringify(jsondb));","internal",0,null);
						//cx.evaluateString(scope,"java.lang.System.out.println(JSON.stringify(transaction));","internal",0,null);
			
						var processit = """
						function processtransaction(t) {
							try { eval("t_"+t["action"]+"(t['params']);"); } catch(err) {
								java.lang.System.out.println(err);
							}
						}
						"""
						cx.evaluateString(scope,processit,"internal",0,null);
						
						var topid = jsondb._2.toInt;
						var lastEntity:Entity = null;
						tlist.foreach(t => {
							cx.evaluateString(scope,"var transaction = "+t.json+";","internal",0,null);
							cx.evaluateString(scope,"processtransaction(transaction);","internal",0,null);
							topid = t.id
							lastEntity = t.entity
						})
						
						cx.evaluateString(scope,"var jsondbasstring = JSON.stringify(JSONDB.jsondb);","internal",0,null);
						var result = scope.get("jsondbasstring", scope);
						if (result == Scriptable.NOT_FOUND) {
							//println("Failure");
							log.severe("There was problem processing the javascript")
						} else {
							// Everything looks good. Process result back into database and return as needed
							var newdb = Context.toString(result);
							log.info("New top id: "+topid)
							//println("Result: "+newdb)
							if (dbsid == 0) {
								Utils.savedb(dbid,newdb,topid,false);
							}
							
							if (lastEntity != null) {
								//var e = datastore.get(lastkey);
								Utils.commit(() => {
									var datastore = DatastoreServiceFactory.getDatastoreService()
									var txn = datastore.beginTransaction();
									try {
										Utils.savedb(datastore,txn,lastEntity,newdb,true)
										txn.commit()
									} finally {
										if (txn.isActive()) {
											txn.rollback()
										}
									}
								},10);
							}
						}
					} catch {
						case e:Throwable => printerror(e);
					} finally {
						Context.exit();
					}
				}
			} catch {
				case e:Throwable => printerror(e)
			}
		}
		var endstamp = System.currentTimeMillis();
		log.info("Consolidate Performance: "+(endstamp-startstamp)+"ms")
		
		"Done"
	}

	// ----------------------------------------------------------------------------------------------
	//
	// Helper Functions
	//
	// ----------------------------------------------------------------------------------------------
	
	/**
	 * Function to add a json transaction to a transaction log
	 */
	def addtransaction(dbid:String,tjson:String,blocksave:Boolean):Long = {
		var sid:Long = 0;
		
		var t = new Entity(dbid+"_transaction");
		t.setProperty("tjson",new com.google.appengine.api.datastore.Text(tjson))
		try {
			t.setProperty("user",userService.getCurrentUser().getEmail());	
		} catch {
			case e:Throwable => t.setProperty("user","Unknown/System");
		}
		t.setProperty("stamp",new Date())
		
		var (key,sid2) = putAndSequenceEntity(t);
		sid = sid2;
		
		Utils.updatedbtopid(dbid,sid)
			
		if (sid%backupjsondbeveryxtransactions == 0 && !blocksave) {
			var queue = QueueFactory.getDefaultQueue();
			queue.add(withUrl("/jsondb/consolidate").param("dbid",dbid))
		}
		
		return sid;
	}
	
	/**
	 * Functions for doing a "sequence" for entities. This is accomplished through locks/memcached atomic actions
	 */
	def putAndSequenceEntity(e:Entity):(Key,Long) = {
		var datastore = DatastoreServiceFactory.getDatastoreService()
		var sid = getNextSequentialId(e.getKind());
		e.setProperty("sid",sid);
		var key = datastore.put(e);
		return (key,sid)
	}
	
	def getNextSequentialId(entityname:String):Long = {
		var done = false;
		var toreturn:Long = -1;
		while (!done) {
			var iscached = memcacheservice.increment("seq_"+entityname,1,0).asInstanceOf[Long]
			if (iscached < Utils.startval) { // Value is not cached
				var r = Utils.getLockOrWait(entityname+"lock");
				if (r == 1) {
					done = true;
					var q = new Query(entityname)
					q.addSort("sid",Query.SortDirection.DESCENDING)
					//q.setKeysOnly();
					var datastore = DatastoreServiceFactory.getDatastoreService()
					var pq = datastore.prepare(q)
					var queryresult = pq.asList(withLimit(1))
					if (queryresult.size > 0) {
						var item = queryresult(0)
						var sid:Long = item.getProperty("sid").asInstanceOf[Long]
						
						//println(sid);
						toreturn = sid+1;
						//println("Next val not in memcached, Retrieving from DB")
					} else { // No records exist, start count at startval
						toreturn = Utils.startval;
						//println("Next val not in memcached, DB is empty, starting at sequence start")
					}
					memcacheservice.put("seq_"+entityname,toreturn)
					Utils.releaseLock(entityname+"lock")
				}
			} else {
				//println("Returning cached transaction value")
				toreturn = iscached
				done = true;
			}
		}
		return toreturn;
	}
	
	/**
	 * Broadcast a message to all channel clients that are listening to this event, excluding the given id.
	 */
	def broadcast(eventid:String,message:String,excludeclient:String) {
		var clientlist = memcacheservice.get(eventid+"_reg");
		//println(clientlist);
		var reset = false;
		var newlist = new ListBuffer[String]();
		if (clientlist != null) {
			clientlist.asInstanceOf[String].split(",").foreach(cid => {
				var isthere = memcacheservice.get(eventid+"_"+cid)
				if (isthere != null) {
					if (cid != excludeclient) {
						//println("Sending message to "+cid+": "+message)
						channelService.sendMessage(new ChannelMessage(cid, message));	
					}
					newlist += cid;
				} else {
					reset = true;
				}
			})
		}
		
		// This could be improved. Probably put it in a transaction
		if (reset) {
			//var lockresult = getLockOrWait(eventid+"_channelreg")
			memcacheservice.put(eventid+"_reg",newlist.mkString(","));
			//if (lockresult == 1) {
			//	releaseLock(eventid+"_channelreg")
			//}
		}
	}
	
	/**
	 * Simple function for handling logging
	 */
	def printerror(e:Throwable) {
	  Utils.printerror(e)
	}
}
 
