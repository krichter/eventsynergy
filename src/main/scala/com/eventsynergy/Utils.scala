package com.eventsynergy

//import scala.language.implicitConversions;
//import scala.language.postfixOps

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
import javax.mail._;
import javax.mail.internet._;
import java.util.logging.Logger;
import java.io.{ByteArrayInputStream,ByteArrayOutputStream}
import java.util.zip._
import scala.io.Source

//import freemarker.template._;

import com.google.appengine.api.users.{UserService,UserServiceFactory}
import com.google.appengine.api.channel.{ChannelServiceFactory,ChannelMessage}
import com.google.appengine.api.datastore.{DatastoreService,DatastoreServiceFactory,Entity,Query,PreparedQuery,Key,KeyFactory,FetchOptions,Transaction,TransactionOptions}
import com.google.appengine.api.datastore.FetchOptions.Builder._
import com.google.appengine.api.memcache.{MemcacheServiceFactory,MemcacheService,Expiration}
import com.google.appengine.api.taskqueue.{Queue,QueueFactory}
import com.google.appengine.api.taskqueue.TaskOptions.Builder._;
import com.google.appengine.api.images._;

//import org.mozilla.javascript._;

object Utils {
	var log = Logger.getLogger(this.getClass.getName());
	var userService = UserServiceFactory.getUserService();
	//var datastore = DatastoreServiceFactory.getDatastoreService();
	var memcacheservice = MemcacheServiceFactory.getMemcacheService();
	var channelService = ChannelServiceFactory.getChannelService();
	implicit def object2PropertyValue(o: Object):PropertyValue = new PropertyValue(o);
	implicit def entity2CustomEntity(e: Entity):CustomEntity = new CustomEntity(e);
	val startval:Long = 1000;
	case class JSONDBTransaction(id:Int,who:String,json:String,datestamp:Date,containsbackup:Boolean,entity:Entity)
	
	def printerror(e:Throwable) {
		log.severe(e.getMessage+"\n"+e.getStackTraceString)
	}
	
	def userallowed(emailaddress:String):Boolean = {
		var testcache = memcacheservice.get("access_"+emailaddress)
		if (testcache != null) {
			//println("Direct Access cache hit, access granted");
			return true;
		} else {
			// Cache miss, check DB
			var datastore = DatastoreServiceFactory.getDatastoreService();
			try {
				//println("Access cache miss");
				
				datastore.get(KeyFactory.createKey("alloweduser",emailaddress))
				memcacheservice.put("access_"+emailaddress,1)
				//println("Access granted");
				return true;
			} catch {
				case e:Throwable => { }
			}
			
			var q = new Query("alloweduser")
			q.setKeysOnly();
			var pq = datastore.prepare(q)
			var rowcount = pq.countEntities(FetchOptions.Builder.withDefaults);
			if (rowcount == 0){
				var e = new Entity("alloweduser",userService.getCurrentUser().getEmail().toLowerCase()); 
				e.setProperty("email",userService.getCurrentUser().getEmail().toLowerCase())
				datastore.put(e);
				memcacheservice.put("access_"+userService.getCurrentUser().getEmail().toLowerCase(),1)
				return true;
			}
		}
		return false;
	}
	
	def flattenNodeSeqList(l:List[NodeSeq]):NodeSeq = {
		if (l == null || l.size() == 0) {
			return null;
		} else if (l.size() == 1) {
			return l(0)
		} else {
			return (l(0) /: l.drop(1)) (_ ++ _)
		}
	}
	
		/**
	 * Locking system, using memcached. Timeout for a lock is 10 seconds
	 */
	def getLockOrWait(label:String):Int = { // Will only hold a lock for 10 seconds
		var result = memcacheservice.increment(label,1,0)
		if (result == 1) { // I have the lock
			memcacheservice.put(label+"_lock",1,Expiration.byDeltaSeconds(10))
			return 1;
		} else { // Someone else has the lock, wait
			var iswaiting = true;
			while (iswaiting) {
				Thread.sleep(1000);
				var waitresult = memcacheservice.get(label+"_lock")
				if (waitresult == null) {
					iswaiting = false;
				}
			}
			return 2;
		} 
	}
	
	def releaseLock(label:String) {
		memcacheservice.put(label,0);
		memcacheservice.delete(label+"_lock")
	}
	
	def eventidExists(eventid:String):Boolean = {
		if (eventid == null) {
			return false;
		}
		var cachecheck = memcacheservice.get("eventcache_"+eventid)
		if (cachecheck != null) {
			return true;
		} else {
			// Cache miss, check DB
			try {
				var ekey = KeyFactory.createKey("event",eventid);
				var datastore = DatastoreServiceFactory.getDatastoreService();
				var e = datastore.get(ekey);
				memcacheservice.put("eventcache_"+eventid,1)
				return true;
			} catch {
				case error:com.google.appengine.api.datastore.EntityNotFoundException => {
					return false
				}
				case e2:Throwable => {
					return false
				}
			}
		}
	}
	
	def getUUID():String = {
	  return UUID.randomUUID().toString();
	}
	
	def stringortext(theval:Object):String = {
		if (theval.isInstanceOf[com.google.appengine.api.datastore.Text]) {
			return theval.asInstanceOf[com.google.appengine.api.datastore.Text].getValue
		} else {
			return theval.toString()
		}
	}
	
	def sot(theval:Object):String = {
		return stringortext(theval);
	}
	
	def containsnull(theval:String):Boolean = {
		return theval.indexOf('\0') > -1;
	}
	
	def stripnulls(theval:String):String = {
		var n = new String();
		theval.foreach(char => {
			if (char != '\0') {
				n = n + char;	
			}
		});
		//var n = theval.replace('0','\0');
		//println(theval.indexOf('\0'));
		if (!theval.equals(n)) {
			println("Stripped: "+theval+" to "+n)	
		}
		
		return n;
	}
	
	def replacenullsinentity(e:Entity) {
		println("Replacing nulls in entity");
		
		var newe = new Entity(e.getKey().getKind(),stripnulls(e.getKey().getName));
		e.getProperties().foreach(p => {
			newe.setProperty(p._1,stripnulls(p._2.getPropertyValue()))
		})
		var datastore = DatastoreServiceFactory.getDatastoreService();
		try {
			datastore.delete(e.getKey());
		} catch {
			case (ex1:Throwable) => printerror(ex1)
		}
		
		try {
			datastore.put(newe);
		} catch {
			 case (ex1:Throwable) => printerror(ex1)
		}
	}
	
	def dollerfy(dvalue:Double):String = {
		var formatter = NumberFormat.getCurrencyInstance();
		return formatter.format(dvalue);
	}
	
	def dollerfy(dvalue:String):String = {
		if (dvalue == null || dvalue == "") {
			return "$0.00";
		} else {
			return dollerfy(dvalue.toDouble)	
		}
		
	}
	
	def safeforjson(value:String):String = {
		if (value == null) {
			return "";
		} else {
			return value.replaceAll("""\\""","""\\\\""").replaceAll(""""""","""\\"""").replaceAll("""\n""","""\\n""").replaceAll("""\r""","""""").replaceAll("""\t""",""" """)
		}
	}
	
	def b2s(a:Array[Byte]):String = new String(a,"UTF-8");
	
	def cleartable(tablename:String) {
		//println("Clearing table "+tablename)
		try {
			var datastore = DatastoreServiceFactory.getDatastoreService();
			var keyset = new ListBuffer[Key]();
			var q = new Query(tablename)
			q.setKeysOnly();
			var pq = datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
				keyset += r.getKey
			})
			datastore.delete(keyset)
		} catch {
			case e:Throwable => printerror(e)
		}
	}
	
	val dbfile_chunksize = 900000
	
	def saveFileIntoDB(filekey:String,data:Array[Byte],filename:String) {
		var datastore = DatastoreServiceFactory.getDatastoreService();
		var chunkindex = 0;
		data.grouped(dbfile_chunksize).foreach(chunk => {
			var chunkentity = new Entity("filestore",filekey+"_"+chunkindex)
			chunkentity.setProperty("filedata",new com.google.appengine.api.datastore.Blob(chunk))
			datastore.put(chunkentity);	
			chunkindex = chunkindex + 1;
		})
		
		var t = new Entity("filestore",filekey)
		t.setProperty("chunkcount",chunkindex)
		t.setProperty("filename",filename)
		datastore.put(t);
	}
	
	def getFileFromDB(filekey:String):Array[Byte] = {
		try {
			var datastore = DatastoreServiceFactory.getDatastoreService();
			var toreturn:Array[Byte] = Array[Byte]();
			var fileinfo = datastore.get(KeyFactory.createKey("filestore",filekey))
			var chunkcount = fileinfo.getProperty("chunkcount").asInstanceOf[Long].toInt
			for (i <- 0 until chunkcount) {
				var c = datastore.get(KeyFactory.createKey("filestore",filekey+"_"+i))
				toreturn = toreturn ++ c.getProperty("filedata").asInstanceOf[com.google.appengine.api.datastore.Blob].getBytes
			}
			return toreturn;
		} catch {
			case e:Throwable => {
				printerror(e)
				return null;
			}
		}
	}
	
	def delFileFromDB(filekey:String) {
		try {
			var datastore = DatastoreServiceFactory.getDatastoreService();
			var fileinfo = datastore.get(KeyFactory.createKey("filestore",filekey))
			var chunkcount = fileinfo.getProperty("chunkcount").asInstanceOf[Long].toInt
			for (i <- 0 until chunkcount) {
				datastore.delete(KeyFactory.createKey("filestore",filekey+"_"+i))
			}
			datastore.delete(KeyFactory.createKey("filestore",filekey))
		} catch {
			case e:Throwable => printerror(e)
		}
	}
	
	def compress(istring:String):Array[Byte] = {
		val is = new ByteArrayInputStream(istring.getBytes("UTF-8"))
		val dis = new DeflaterInputStream(is)
		return inputStreamToByteArray(dis)
	}
	
	def uncompress(in:Array[Byte]):String = {
		val ins = new ByteArrayInputStream(in);
		val iis = new InflaterInputStream(ins)
		return new String(inputStreamToByteArray(iis))
	}
	
	def inputStreamToByteArray(is: java.io.InputStream): Array[Byte] = Iterator continually is.read takeWhile (-1 !=) map (_.toByte) toArray
			
	def updatedbtopid(dbid:String,topid:Long) {
		Utils.commit(() => {
			var datastore = DatastoreServiceFactory.getDatastoreService()
			var txn = datastore.beginTransaction();
			try {
				var ekey = KeyFactory.createKey("event",dbid);
				var e = datastore.get(txn,ekey);
				var oldid = e.getPropertyAsString("topid","0").toString.toLong
				if (topid > oldid) {
					e.setProperty("toptid",topid)
					datastore.put(txn,e);
				}
				txn.commit();
			} finally {
				if (txn.isActive()) {
					txn.rollback();
				}
			}
		},10);
	}
			
	//val db_chunksize = 900000
	//val db_chunksize = 20
	
	def savedb(dbid:String,jsondb:String,tid:Long,compressed:Boolean) {
		
		this.commit(() => {
			var datastore = DatastoreServiceFactory.getDatastoreService()
			var txn = datastore.beginTransaction();
			try {
				var ekey = KeyFactory.createKey("event",dbid);
				var e = datastore.get(txn,ekey);
				e.setProperty("tid",tid)
				savedb(datastore,txn,e,jsondb,compressed)
				
				txn.commit();
			} finally {
				if (txn.isActive()) {
					txn.rollback()
				}
			}
		},10)
	}
	/**
	 * Function to handle saving the json db into a GAE entity. Due to a 1MB limitation on
	 * a single entity property, this function chunks the json down.
	 */
	def savedb(ds:DatastoreService,txn:Transaction,e:Entity,setjsondb:String,compressed:Boolean) {
		var jsondb:Array[Byte] = null;
		if (compressed) {
			jsondb = Utils.compress(setjsondb)
			e.setUnindexedProperty("dbstyle","compressed")
		} else {
			jsondb = setjsondb.getBytes("UTF-8")
			e.setUnindexedProperty("dbstyle","uncompressed")
		}
		
		var rawoldcount = e.getProperty("dbchunkcount");
		var oldcount:Long = 0;
		if (rawoldcount != null) {
			oldcount = rawoldcount.asInstanceOf[Long]
		}
		
		var newchunks = jsondb.grouped(dbfile_chunksize)
		var newchunkcount = newchunks.size.toLong
		if (newchunkcount < oldcount) {
			for (i <- newchunkcount.until(oldcount+1)) {
				try {
					e.removeProperty("jsondb_chunk_"+i);
				}
			}
		}
		
		var c = 1;
		jsondb.grouped(dbfile_chunksize).foreach(chunk => {
			e.setUnindexedProperty("jsondb_chunk_"+c,new com.google.appengine.api.datastore.Blob(chunk))
			c = c+1;
		})

		e.setUnindexedProperty("dbchunkcount",newchunkcount)
		ds.put(txn,e);
	}
	
	/**
	 * This function is to dechunk the saved json and return it as a tuple with the related transactionid
	 */
	def getdb(e:Entity):(String,Long) = {
		var rawoldcount = e.getProperty("dbchunkcount");
		var oldcount:Long = 0;
		if (rawoldcount != null) {
			oldcount = rawoldcount.asInstanceOf[Long]
		}
		var dbstyle = e.getProperty("dbstyle");
		var iscompressed = true;
		if (dbstyle == "uncompressed") {
			iscompressed = false;
		}

		var tid:Long = startval-1;
		try {
			tid = e.getProperty("tid").asInstanceOf[Long];
		}
		if (tid == 0) {
			tid = startval-1;
		}
		
		var jsondb:String = null;
		if (oldcount == 0) {
			jsondb = "{}"
		} else {
			// New, chunked mode
			var rawjsondb = new ListBuffer[Byte]()
			for (i <- (1:Long).until(oldcount+1)) {
				rawjsondb = rawjsondb ++ e.getProperty("jsondb_chunk_"+i).asInstanceOf[com.google.appengine.api.datastore.Blob].getBytes()
			}
			if (iscompressed) {
				jsondb = Utils.uncompress(rawjsondb.toArray)	
			} else {
				jsondb = b2s(rawjsondb.toArray)
			}
		}

		return (jsondb,tid)
	}
	
	def getdb(dbid:String):(String,Long) = {
		var ekey = KeyFactory.createKey("event",dbid);
		var datastore = DatastoreServiceFactory.getDatastoreService();
		var e = datastore.get(ekey);
		return getdb(e)
	}
	
	def isJSON(jsonstring:String):Boolean = {
		try {
			val parsed = JSON.parseFull(jsonstring)
			if (parsed.isEmpty) {
				return false
			} else {
				return true;
			}
		} catch {
			case e:Throwable => {return false}
		}
	}
	
	def getTransactionList(dbid:String,fromid:Int,toid:Int,limit:Int,asc:Boolean):ListBuffer[JSONDBTransaction] = {
		var tlist = new ListBuffer[JSONDBTransaction]();
		var q = new Query(dbid+"_transaction")
		if (asc) {
			q.addSort("sid",Query.SortDirection.ASCENDING)	
		} else {
			q.addSort("sid",Query.SortDirection.DESCENDING)
		}
		
		if (fromid > 0) {
			//q.addFilter("sid",Query.FilterOperator.GREATER_THAN, fromid)
			q.setFilter(new Query.FilterPredicate("sid",Query.FilterOperator.GREATER_THAN, fromid))
			//log.info("TL Query - Adding fromid: "+fromid)
		}
		if (toid > 0) {
			//q.addFilter("sid",Query.FilterOperator.LESS_THAN_OR_EQUAL, toid)
			q.setFilter(new Query.FilterPredicate("sid",Query.FilterOperator.LESS_THAN_OR_EQUAL, toid))
			//log.info("TL Query - Adding toid: "+toid)
		}
		var datastore = DatastoreServiceFactory.getDatastoreService();
		var pq = datastore.prepare(q)
		//var queryresult = pq.asList(withLimit(1))
		//:java.util.List[Entity]
		var queryresult:java.util.List[Entity] = null;
		if (limit > 0) {
			queryresult = pq.asList(FetchOptions.Builder.withLimit(limit))
		} else {
			queryresult = pq.asList(FetchOptions.Builder.withDefaults)
		}
		queryresult.foreach(r => {
			var dstring = "N/A";
			var isbackup = false;
			var iscompressed = true;
			if (r.getProperty("dbchunkcount") != null) {
				isbackup = true;
			}
			var tc = r.getProperty("tjson_compressed")
			var tjson = "";
			if (tc == null) {
				tjson = r.getProperty("tjson").asInstanceOf[com.google.appengine.api.datastore.Text].getValue()
			} else {
				tjson = Utils.uncompress(tc.asInstanceOf[com.google.appengine.api.datastore.Blob].getBytes())
			}

			tlist += JSONDBTransaction(r.getPropertyAsString("sid").toInt,r.getPropertyAsString("user"),tjson,r.getProperty("stamp").asInstanceOf[Date],isbackup,r)
		})
		//log.info("TL Size: "+tlist.size)
		return tlist;
	}
	
	def getTransaction(dbid:String,sid:Long):JSONDBTransaction = {
		var q = new Query(dbid+"_transaction")
		//q.addFilter("sid",Query.FilterOperator.EQUAL, sid.toLong)
		q.setFilter(new Query.FilterPredicate("sid",Query.FilterOperator.EQUAL, sid.toLong))
		var datastore = DatastoreServiceFactory.getDatastoreService();
		var pq = datastore.prepare(q)
		var r = pq.asSingleEntity() //.asList(FetchOptions.Builder.withDefaults)
		if (r != null) {
			//jsondb = Utils.getdb(e)._1
			var dstring = "N/A";
			var isbackup = false;
			var iscompressed = true;
			if (r.getProperty("dbchunkcount") != null) {
				isbackup = true;
			}
			var tc = r.getProperty("tjson_compressed")
			var tjson = "";
			if (tc == null) {
				tjson = r.getProperty("tjson").asInstanceOf[com.google.appengine.api.datastore.Text].getValue()
			} else {
				tjson = Utils.uncompress(tc.asInstanceOf[com.google.appengine.api.datastore.Blob].getBytes())
			}
			return JSONDBTransaction(r.getPropertyAsString("sid").toInt,r.getPropertyAsString("user"),tjson,r.getProperty("stamp").asInstanceOf[Date],isbackup,r)
		} else {
			return null;
		}
	}
	
	/*def CommitTransactionLoop(txn:Transaction,currentcount:Int) {
		try {
			txn.commit();
		} catch {
			case e:java.util.ConcurrentModificationException => {
				Thread.sleep(100);
				if (currentcount > 0) {
					CommitTransactionLoop(txn,currentcount-1)
				}
			}
		}
	}*/
	
	def commit(f:Function0[Any],count:Int) {
		try {
			f()
		} catch {
			case e:java.util.ConcurrentModificationException => {
				this.printerror(e)
				log.info("Entity Contention, retrying transaction")
				Thread.sleep(100);
				if (count > 0) {
					commit(f,count-1)
				}
			}
		}
	}
}