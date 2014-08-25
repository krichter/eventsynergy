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
import javax.mail._;
import javax.mail.internet._;
import java.util.logging.Logger;
//import scala.language.implicitConversions;

import freemarker.template._;

import com.google.appengine.api.users.{UserService,UserServiceFactory}
import com.google.appengine.api.channel.{ChannelServiceFactory,ChannelMessage}
import com.google.appengine.api.datastore.{DatastoreService,DatastoreServiceFactory,Entity,Query,PreparedQuery,Key,KeyFactory,FetchOptions,Transaction,TransactionOptions}
import com.google.appengine.api.datastore.FetchOptions.Builder._
import com.google.appengine.api.memcache.{MemcacheServiceFactory,MemcacheService,Expiration}
import com.google.appengine.api.taskqueue.{Queue,QueueFactory}
import com.google.appengine.api.taskqueue.TaskOptions.Builder._;
import com.google.appengine.api.images._;
import com.google.appengine.api.taskqueue.TaskOptions.Method;

import org.mozilla.javascript._;

/**
 * This in a class built on the Scalatra framework
 */
class CSScalatraServlet extends ScalatraServlet with FileUploadSupport {
	var log = Logger.getLogger(this.getClass.getName());
	// Get all the google services into this instance
	var userService = UserServiceFactory.getUserService();
	var datastore = DatastoreServiceFactory.getDatastoreService();
	var memcacheservice = MemcacheServiceFactory.getMemcacheService();
	
	//var channelService = ChannelServiceFactory.getChannelService();
	//var blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
	//implicit def textToString(input: com.google.appengine.api.datastore.Text): String = input.getValue();
	implicit def object2PropertyValue(o: Object):PropertyValue = new PropertyValue(o);
	implicit def entity2CustomEntity(e: Entity):CustomEntity = new CustomEntity(e);
	case class Customfield(fieldid:String,label:String,description:String,fieldtype:String,ismanditory:String,fieldoptions:Array[String])
	case class Affiliationgroup(groupid:String,label:String)
	case class Group(groupid:String,label:String,modifier:String)
	case class Grouparea(groupareaid:String,label:String,description:String,ismanditory:String,groups:Array[Group])
	case class Groupselection(groupareaid:String,groupareaname:String,selectedgroupid:String,selectedgroupname:String,selectedgroupmodifier:String)
		
	// Freemarker template handling setup
	var templatecfg = new Configuration();
		
	// Set some defaults
	var startval:Long = 1000;
	var presencetimeout = 300;
	
	put("*") {
		halt(404);
	}
	
	delete("*") {
		halt(404);
	}
	
	get("/register") {
		var eventid = params.getOrElse("eventid",null)
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		var isallowed = false;
		var eventsettings:Map[String,String] = new HashMap[String,String]();
		var customfields = new ListBuffer[Customfield]();
		var affiliationgroups = new ListBuffer[Affiliationgroup]();
		
		var groupareas = new ListBuffer[Grouparea]();
		var event_title = "";
		try {
			var e = datastore.get(KeyFactory.createKey("event",eventid));
			event_title = e.getPropertyAsString("title")
			val rawstatus = e.getPropertyAsString("onlinestatus")
			if (rawstatus.equals("online")) {
				isallowed = true;
			}
			
			//val jsondb = Utils.getdb(eventid)._1
			val jsondb = e.getPropertyAsString("formdata")
			val parseddb = JSON.parseFull(jsondb)
			val db:scala.collection.immutable.Map[String,Any] = parseddb.getOrElse(null).asInstanceOf[scala.collection.immutable.Map[String,Any]];
			try {
				db("settings").asInstanceOf[scala.collection.immutable.Map[String,Any]].foreach(item => {
					if (item._2.isInstanceOf[java.lang.String]) {
						eventsettings += ((item._1,item._2.toString()))
					}
				})
				/*eventsettings.foreach(s => {
					println(s._1+" -> "+s._2)
				})*/
			} catch {
				case e:Throwable => {
					println("settings parse error")
					e.printStackTrace()
				}
			}
			
			try {
				db.getOrElse("affiliation", Map[String,Any]().toMap).asInstanceOf[scala.collection.immutable.Map[String,Any]].foreach(item => {
					val a = item._2.asInstanceOf[scala.collection.immutable.Map[String,Any]]
					affiliationgroups += Affiliationgroup(a.getOrElse("id","").toString(),a.getOrElse("groupname","").toString())
				})
				/*affiliationgroups.foreach(a => {
					println(a)
				})*/
			} catch {
				case e:Throwable => {
					println("affiliations parse error")
					e.printStackTrace()
				}
			}
			
			try {
				val fieldmap = db("settings").asInstanceOf[scala.collection.immutable.Map[String,Any]].getOrElse("customfields", Map[String,Any]().toMap).asInstanceOf[scala.collection.immutable.Map[String,Any]]
				db("settings").asInstanceOf[scala.collection.immutable.Map[String,Any]].getOrElse("customordering", List[String]()).asInstanceOf[List[String]].foreach(fieldid => {
					val field = fieldmap(fieldid).asInstanceOf[scala.collection.immutable.Map[String,Any]]
					if (field.getOrElse("isonreg","").toString() == "1") {
						var options = new ListBuffer[String]();
						if (field.getOrElse("fieldtype","").toString() == "list") {
							try {
								options ++= field("fielddata").asInstanceOf[List[String]]
							} catch {
								case e2:Throwable => {
									println("custom fields list error")
									e2.printStackTrace()
								}
							}
						}
						customfields += Customfield(
							fieldid,
							field.getOrElse("fieldname","").toString(),
							field.getOrElse("publicinstructions","").toString(),
							field.getOrElse("fieldtype","").toString(),
							field.getOrElse("ismanditory","").toString(),
							options.toArray
						)
					}
				})
				//println(customfields);
			} catch {
				case e:Throwable => {
					println("customfields parse error")
					e.printStackTrace()
				}
			}
			
			try {
				val gamap = db("groupareas").asInstanceOf[scala.collection.immutable.Map[String,Any]]
				gamap("orderarray").asInstanceOf[List[String]].foreach(gaid => {
					try {
						val ga = gamap(gaid).asInstanceOf[scala.collection.immutable.Map[String,Any]]
						if (ga.getOrElse("isregchoice","").toString() == "1") {
							var groups = new ListBuffer[Group]();
							
							ga("groupordering").asInstanceOf[List[String]].foreach(gid => {
								val g = ga("groups").asInstanceOf[scala.collection.immutable.Map[String,Any]](gid).asInstanceOf[scala.collection.immutable.Map[String,Any]]
								if (g.getOrElse("hidereg","0") == "0") {
									groups += Group(gid,g.getOrElse("label","").toString(),Utils.dollerfy(g.getOrElse("modifier","0").toString()))	
								}
							})

							groupareas += Grouparea(gaid,
								ga.getOrElse("label","").toString(),
								ga.getOrElse("publicdescription","").toString(),
								ga.getOrElse("ismanditory","").toString(),
								groups.toArray
							);
						}
					} catch {
						// Will trigger if there aren't any groups in a grouparea
						case e2:Throwable => e2.printStackTrace()
					}
				})
			} catch {
				case e:Throwable => {
					println("groups parse error")
					e.printStackTrace()
				}
			}
		}
		
		var m = new java.util.HashMap[String,Any]();
		m.put("isallowed",isallowed)
		m.put("settings",eventsettings)
		m.put("eventid",eventid)
		m.put("eventtitle",event_title)
		m.put("affiliationgroups",affiliationgroups.toArray)
		m.put("groupmap",groupareas.toArray)
		m.put("customfields",customfields.toArray)
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		var t = templatecfg.getTemplate("register.ftl")
		t.process(m,response.getWriter)
	}

	get("/manageapp/image") {
		var imageid = params.getOrElse("imageid",null)
		var size = params.getOrElse("size","large")
		
		if (imageid != null) {
			try {
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
	
	get("/manageapp/online") {
		var eventid = params.getOrElse("eventid",null)
		var status = params.getOrElse("status","offline")
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		
		var ekey = KeyFactory.createKey("event",eventid);
		var e = datastore.get(ekey);
		e.setProperty("onlinestatus",status)
		datastore.put(e);
		"Event status is now: "+status
	}
	
	post("/manageapp/publish") {
		var eventid = params.getOrElse("eventid",null)
		var jsondata = params.getOrElse("jsondata","{}")
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		//log.info(jsondata)
		
		var ekey = KeyFactory.createKey("event",eventid);
		var e = datastore.get(ekey);
		e.setProperty("formdata",new com.google.appengine.api.datastore.Text(jsondata))
		datastore.put(e);
		
		"""{"success":true}"""
	}
	
	get("/manageapp/consolidate") {
		var eventid = params.getOrElse("eventid",null)
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		var queue = QueueFactory.getDefaultQueue();
		queue.add(withUrl("/jsondb/consolidate").param("dbid",eventid))
		"DB Consolidation forced. It will be done within the next few minutes...";
	}
	
	post("/register") {
		var eventid = params.getOrElse("eventid",null)
		if (!Utils.eventidExists(eventid)) {
			halt(404);
		}
		var groupsummary = "";
		var emailsummary = "";
		
		// Need to check that eventid exists and is open for registration
		var varmap = new HashMap[String,String]();

		var firstname = params.getOrElse("firstname",null)
		varmap += (("firstname",firstname))
		emailsummary += "First Name: "+firstname+"\n";
		
		var lastname = params.getOrElse("lastname",null)
		varmap += (("lastname",lastname))
		emailsummary += "Last Name: "+lastname+"\n";
		
		var homephone = params.getOrElse("homephone",null)
		varmap += (("homephone",homephone))
		emailsummary += "Home Phone #: "+homephone+"\n";
		
		var mobilephone = params.getOrElse("mobilephone",null)
		varmap += (("mobilephone",mobilephone))
		emailsummary += "Mobile Phone #: "+mobilephone+"\n";
		
		var email = params.getOrElse("email",null)
		varmap += (("email",email))
		emailsummary += "Email Address: "+email+"\n";
		
		var parents_name = params.getOrElse("parents_name",null)
		varmap += (("parents_name",parents_name))
		emailsummary += "Parents Names: "+parents_name+"\n";
		
		var parents_phone = params.getOrElse("parents_phone",null)
		varmap += (("parents_phone",parents_phone))
		emailsummary += "Parents Phone #: "+parents_phone+"\n";
		
		var emergencyinfo = params.getOrElse("emergencyinfo",null)
		varmap += (("emergencyinfo",emergencyinfo))
		emailsummary += "Emergency Info: "+emergencyinfo+"\n";
		
		var carecard = params.getOrElse("carecard",null)
		varmap += (("carecard",carecard))
		emailsummary += "Card Card #: "+carecard+"\n";
		
		//DateOfBirth_Month
		//DateOfBirth_Day
		//DateOfBirth_Year
		var birthdate_month = params.getOrElse("DateOfBirth_Month","01")
		var birthdate_day = params.getOrElse("DateOfBirth_Day","01")
		var birthdate_year = params.getOrElse("DateOfBirth_Year","2012")
		//var birthdate = params.getOrElse("birthdate",null)
		var birthdate = birthdate_month+"/"+birthdate_day+"/"+birthdate_year
		varmap += (("birthdate",birthdate))
		emailsummary += "Birth Date: "+birthdate+"\n";
		
		var gender = params.getOrElse("gender",null)
		varmap += (("gender",gender))
		emailsummary += "Gender: "+gender+"\n";
		
		var address_street = params.getOrElse("address_street",null)
		varmap += (("address_street",address_street))
		emailsummary += "Address: Street: "+address_street+"\n";
		
		var address_city = params.getOrElse("address_city",null)
		varmap += (("address_city",address_city))
		emailsummary += "Address: City: "+address_city+"\n";

		var address_postal = params.getOrElse("address_postal",null)
		varmap += (("address_postal",address_postal))
		emailsummary += "Address: Postal Code: "+address_postal+"\n";

		var affiliation = params.getOrElse("affiliation",null)
		if (affiliation == "nothing") {
			affiliation = "";
		}
		varmap += (("affiliation",affiliation))
		emailsummary += "Affiliation: "+affiliation+"\n";

		var comments = params.getOrElse("comments",null);
		varmap += (("comments",comments))
		emailsummary += "Comments: "+comments+"\n";
		
		var shopamount = params.getOrElse("shopamount",null)
		varmap += (("shopamount",shopamount))
		
		var picturedata = this.fileParams("picture");
		var picturefileid = "";
		
		var selectlist = new ListBuffer[Groupselection]()
		var eventsettings = new HashMap[String,String]();
		var event_title = "";
		var totalcost = 0.00;
		var emailmessage = "";
		var notificationemail = "";
		var customfieldsummary = "";
		var cfieldlist = new ListBuffer[String]();
		
		var isallowed = false;
		if (eventid != null) {
			try {
				if (picturedata != null && picturedata.filename != "") {
					//println("picturedata",picturedata)
					var imagesService = ImagesServiceFactory.getImagesService();
					var oldImage1 = ImagesServiceFactory.makeImage(picturedata.data);
					var oldImage2 = ImagesServiceFactory.makeImage(picturedata.data);
					var resizetransform1 = ImagesServiceFactory.makeResize(150, 150);
					var resizetransform2 = ImagesServiceFactory.makeResize(500, 500);
					var isettings = new OutputSettings(ImagesService.OutputEncoding.JPEG)
					isettings.setQuality(80);
					var smallthumb = imagesService.applyTransform(resizetransform1,oldImage1,isettings)
					var largethumb = imagesService.applyTransform(resizetransform2,oldImage2,isettings)
					picturefileid = Utils.getUUID();
					
					var imageentity = new Entity("imagestore",picturefileid);
					imageentity.setProperty("smallthumb",new com.google.appengine.api.datastore.Blob(smallthumb.getImageData))
					imageentity.setProperty("largethumb",new com.google.appengine.api.datastore.Blob(largethumb.getImageData))
					datastore.put(imageentity)
				}
			} catch {
				case e:Throwable => {
					picturefileid = "";
					log.severe(e.getStackTraceString)
				}
			}
			try {
				var e = datastore.get(KeyFactory.createKey("event",eventid));
				event_title = e.getProperty("title").getPropertyValue()
				if (e.getPropertyAsString("onlinestatus") == "online") {
					isallowed = true;
				}
				
				//val jsondb = Utils.getdb(eventid)._1
				val jsondb = e.getPropertyAsString("formdata")
				val parseddb = JSON.parseFull(jsondb)
				val db:scala.collection.immutable.Map[String,Any] = parseddb.getOrElse(null).asInstanceOf[scala.collection.immutable.Map[String,Any]];
				
				try {
					db("settings").asInstanceOf[scala.collection.immutable.Map[String,Any]].foreach(item => {
						if (item._2.isInstanceOf[java.lang.String]) {
							eventsettings += ((item._1,item._2.toString()))
						}
						if (item._1 == "publicemailmessage") {
							emailmessage = item._2.toString();
						}
						if (item._1 == "emailnotificationaddress") {
							notificationemail = item._2.toString();
						}
					})
				} catch {
					case e:Throwable => {
						println("settings parse error")
						e.printStackTrace()
					}
				}
				
				try {
					params.filter(s => s._1.startsWith("grouparea_")).foreach(gparam => {
						var gaid = gparam._1.drop(10)
						var selection = gparam._2
						var ga = db("groupareas").asInstanceOf[scala.collection.immutable.Map[String,Any]](gaid).asInstanceOf[scala.collection.immutable.Map[String,Any]]
						var grouparealabel = ga("label").toString()
						if (selection != null && selection != "") {
							var g = ga("groups").asInstanceOf[scala.collection.immutable.Map[String,Any]](selection).asInstanceOf[scala.collection.immutable.Map[String,Any]]
							var grouplabel = g("label").toString();
							var modifier = g.getOrElse("modifier","0").toString();
							if (modifier == "" || modifier == null) {
								modifier = "0";
							}
							selectlist += Groupselection(gaid,grouparealabel,selection,grouplabel,Utils.dollerfy(modifier))
							groupsummary += grouparealabel+" Choice: "+grouplabel+": "+modifier+" ("+Utils.dollerfy(modifier)+")\n";
							try {
								totalcost = totalcost + modifier.toFloat
							}
						}
					})
				} catch {
					case e:Throwable => {
						println("groups selection parse error")
						e.printStackTrace()
					}
				}

				try {
					params.filter(s => s._1.startsWith("customfield_")).foreach(cfparam => {
						var cfid = cfparam._1.drop(12)
						var entry = cfparam._2
						var cf = db("settings").asInstanceOf[scala.collection.immutable.Map[String,Any]]("customfields").asInstanceOf[scala.collection.immutable.Map[String,Any]](cfid).asInstanceOf[scala.collection.immutable.Map[String,Any]]
						var cflabel = cf("fieldname").toString()
						customfieldsummary += cflabel+": "+entry+"\n"
						cfieldlist += """""""+cfid+"""":{"fieldlabel":""""+Utils.safeforjson(cflabel)+"""","entry":""""+Utils.safeforjson(entry)+""""}"""
					})
				} catch {
					case e:Throwable => {
						println("custom field selection parse error")
						e.printStackTrace()
					}
				}
			} catch {
				case e:Throwable => printerror(e)
			}
		}
		if (shopamount != "" && shopamount != null) {
			groupsummary += "Candy Cabin: "+Utils.dollerfy(shopamount)+"\n";
			try {
				totalcost = totalcost + shopamount.toDouble;
			} catch {
				case e:Throwable => log.severe(e.getStackTraceString)
			}
		}
		
		groupsummary += "Total: "+Utils.dollerfy(totalcost)+"\n";
		varmap += (("groupselection",selectlist.map(item => {
			item.groupareaid+":"+item.selectedgroupid
		}).mkString(",")))

		varmap += (("picturefileid",picturefileid))
		
		var now = new Date();
		var sdf = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss z");
		sdf.setTimeZone(TimeZone.getTimeZone("America/Vancouver"));		
		varmap += (("submitstamp",sdf.format(now)))
		
		var registrationid = Utils.getUUID();
		varmap += (("id",registrationid))
		
		var tdata = varmap.map(item => {
			"\""+item._1+"\":\""+Utils.safeforjson(item._2)+"\""
		}).mkString(",")
		
		var transaction = """{"action":"addregistration","params":{"""+tdata+""","groupselection":{"""+selectlist.map(g => "\""+g.groupareaid+"\":\""+g.selectedgroupid+"\"").mkString(",")+"""},"customfields":{"""+cfieldlist.mkString(",")+"""}}}""";
		
		emailsummary += customfieldsummary
		//println(transaction)
		//println("Is JSON?: "+Utils.isJSON(transaction))
		
		if (isallowed) {
			try {
				if (Utils.isJSON(transaction)) {
					var queue = QueueFactory.getDefaultQueue();
					queue.add(withUrl("/jsondb/internalt").param("dbid", eventid).method(Method.POST).param("transaction",transaction));
				} else {
					groupsummary += "\nDue to an error, this registration was not properly recorded and will have to be enterred manually";
					log.severe("Transaction JSON didn't parse properly. T: "+transaction)
				}
			} catch {
				case e:Throwable => printerror(e)
			}
			
			//var emailmessage = "";
			//var notificationemail = "";
			try {
				if (email != "" && emailmessage != "") {
					var msg = new MimeMessage(Session.getDefaultInstance(new Properties(),null))
					msg.setFrom(new InternetAddress("do-not-reply@foursquareyouthcamp.appspotmail.com","Do Not Reply"))
					if (notificationemail != "") {
						msg.setReplyTo(Array(new InternetAddress(notificationemail, "Camp Synergy Admin")))
					}
					msg.addRecipient(Message.RecipientType.TO,new InternetAddress(email, firstname+" "+lastname))
					msg.setSubject("Registration Submission Recieved")
					msg.setText(emailmessage+"\n\nSummary of group selection:\n"+groupsummary);
					Transport.send(msg);
					println("Reg email sent to person")
				}
			} catch {
				case e:Throwable => printerror(e)
			}
			
			try {
				if (notificationemail != "") {
					var msg = new MimeMessage(Session.getDefaultInstance(new Properties(),null))
					msg.setFrom(new InternetAddress("do-not-reply@foursquareyouthcamp.appspotmail.com","Do Not Reply"))
					msg.setReplyTo(Array(new InternetAddress(notificationemail, "Camp Synergy Admin")))
					msg.addRecipient(Message.RecipientType.TO,new InternetAddress(notificationemail, "Camp Synergy Admin"))
					msg.setSubject("Camp Synergy Registration Notification")
					msg.setText("A registration was recieved\n\n"+emailsummary+"\n\nGroup Summary:\n"+groupsummary);
					//println("A registration was recieved\n\n"+emailsummary+"\n\nGroup Summary:\n"+groupsummary);
					Transport.send(msg);
					//println("Notification email sent");
				}
			} catch {
				case e:Throwable => printerror(e)
			}
			
		}
		
		var m = new java.util.HashMap[String,Any]();
		m.put("settings",eventsettings)
		m.put("submission",varmap)
		m.put("shopamount",Utils.dollerfy(shopamount))
		m.put("groupselection",selectlist.toArray)
		m.put("totalcost",Utils.dollerfy(totalcost))
		//m.put("eventlist",eventlist.toArray)
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		var t = templatecfg.getTemplate("registrationsubmitted.ftl")
		t.process(m,response.getWriter)
		
	}
	
	get("/ping") {
		"pong"
	}
	
	get("/") {
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		case class LiveEvent(id:String,label:String); //,description:String,url:String
		var eventlist = new ListBuffer[LiveEvent]();
		
		var q = new Query("event")
		//q.addSort("title",Query.SortDirection.ASCENDING)
		//q.addFilter("onlinestatus",Query.FilterOperator.EQUAL, "online")
		q.setFilter(new Query.FilterPredicate("onlinestatus",Query.FilterOperator.EQUAL, "online"))
		var pq = datastore.prepare(q)
		var queryresult = pq.asList(FetchOptions.Builder.withDefaults)
		var rlist = new ListBuffer[String]();
		queryresult.foreach(r => {
			var dbid = r.getKey().getName
			eventlist += LiveEvent(dbid,r.getPropertyAsString("title")); //,event_description,event_url
		})

		var m = new java.util.HashMap[String,Any]();
		m.put("message","<b>test</b>")
		m.put("eventlist",eventlist.toArray)
		var t = templatecfg.getTemplate("eventlist.ftl")
		t.process(m,response.getWriter)
	}

		/*
	get("/manage/emailer") {
		var eventid = params.getOrElse("eventid",null);
		
		var sendgrouplist = new ListBuffer[Groupitem]();
		sendgrouplist += Groupitem("","All People");
		var q = new Query(eventid+"_affiliationgroups")
		datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
			sendgrouplist += Groupitem("a:"+r.getPropertyAsString("rowid"),r.getPropertyAsString("groupname"))
		})

		
		q = new Query(eventid+"_groupareas")
		var galist = new HashMap[String,Grouparea]();
		datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
			galist += ((r.getPropertyAsString("rowid"),Grouparea(r.getPropertyAsString("rowid"),r.getPropertyAsString("label"),new ListBuffer[Group])));
		})
		
		q = new Query(eventid+"_groups")
		datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
			galist(r.getPropertyAsString("groupareaid")).groups += Group(r.getPropertyAsString("rowid"),r.getPropertyAsString("label"))
		})
		
		galist.foreach(ga => {
			//sendgrouplist += groupitem("m:"+ga._2.rowid,ga._2.label);
			ga._2.groups.foreach(g => {
				sendgrouplist += Groupitem("g:"+g.rowid,ga._2.label+": "+g.label);
			});
			//sendgrouplist += groupitem("u:"+ga._2.rowid,"&nbsp;&nbsp;&nbsp;"+ga._2.label+" Unassigned")
		});
		
		var m = new java.util.HashMap[String,Any]();
		m.put("sendlist",sendgrouplist.toArray);
		m.put("eventid",eventid);
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		var t = templatecfg.getTemplate("emailer.ftl")
		t.process(m,response.getWriter)
	}
	
	post("/manage/emailit") {
		var eventid = params.getOrElse("eventid",null);
		var to = params.getOrElse("to",null)
		var from_name = params.getOrElse("from_name",null);
		var from_email = params.getOrElse("from_email",null);
		var subject = params.getOrElse("subject",null);
		var message = params.getOrElse("message",null);
		
		var emaillist = new ListBuffer[String]();
		if (to.length > 2 && to.substring(0,2) == "a:") {
			var itemid = to.substring(2)
			var q = new Query(eventid+"_people")
			datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
				if (r.getPropertyAsString("affiliation") == itemid && !emaillist.contains(r.getPropertyAsString("email")) && r.getPropertyAsString("email").trim() != "") {
					emaillist += r.getPropertyAsString("email");
				}
			})
		//} else if (to.length > 2 && to.substring(0,2) == "u:") {
		//	var itemid = to.substring(2)
		//} else if (to.length > 2 && to.substring(0,2) == "m:") {
		//	var itemid = to.substring(2)
		} else if (to.length > 2 && to.substring(0,2) == "g:") {
			var itemid = to.substring(2)
			var q = new Query(eventid+"_groupmembership")
			datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
				if (r.getPropertyAsString("groupid") == itemid) {
					// && emaillist.contains(r.getPropertyAsString("email")) && r.getPropertyAsString("email").trim() != ""
					var e = datastore.get(KeyFactory.createKey(eventid+"_people",r.getPropertyAsString("personid")))
					//emaillist += r.getPropertyAsString("email");
					if (e != null && !emaillist.contains(e.getPropertyAsString("email")) && e.getPropertyAsString("email").trim() != "") {
						emaillist += e.getPropertyAsString("email");
					}
				}
			})
		} else if (to == "") {
			var q = new Query(eventid+"_people")
			datastore.prepare(q).asList(FetchOptions.Builder.withDefaults).foreach(r => {
				if (!emaillist.contains(r.getPropertyAsString("email")) && r.getPropertyAsString("email").trim() != "") {
					emaillist += r.getPropertyAsString("email");
				}
			})
		}
		
		if (from_name != null && from_email != null && subject != null && message != null) {
			emaillist.foreach(e => {
				try {
					var msg = new MimeMessage(Session.getDefaultInstance(new Properties(),null))
					msg.setFrom(new InternetAddress("do-not-reply@campsynergy.appspotmail.com","Do Not Reply"))
					msg.setReplyTo(Array(new InternetAddress(from_email, from_name)))
					msg.addRecipient(Message.RecipientType.TO,new InternetAddress(e))//, "Camp Member"
					msg.setSubject(subject)
					msg.setText(message);
					Transport.send(msg);
					//println("Reg email sent to person")
				} catch {
					case e => printerror(e)
				}
			});
		}
		
		var m = new java.util.HashMap[String,Any]();
		m.put("emaillist",emaillist.toArray);
		templatecfg.setServletContextForTemplateLoading(servletContext,"WEB-INF/templates")
		var t = templatecfg.getTemplate("emailsent.ftl")
		t.process(m,response.getWriter)
	}
	*/
	// ----------------------------------------------------------------------------------------------
	//
	// Helper Functions
	//
	// ----------------------------------------------------------------------------------------------
	
	def printerror(e:Throwable) {
		log.severe(e.getMessage+"\n"+e.getStackTraceString)
	}
}
 
