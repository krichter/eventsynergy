package com.eventsynergy

import com.google.appengine.api.datastore.{DatastoreService,DatastoreServiceFactory,Entity,Query,PreparedQuery,Key,KeyFactory,FetchOptions}

class CustomEntity(e:Entity) {
	
	def getPropertyAsString(propertyname:String,defaultvalue:String):String = {
		var theval = e.getProperty(propertyname);
		if (theval == null) {
			return defaultvalue;
		} else {
			if (theval.isInstanceOf[com.google.appengine.api.datastore.Text]) {
				return theval.asInstanceOf[com.google.appengine.api.datastore.Text].getValue
			} else {
				return theval.toString()
			}
		}
	}
	
	def getPropertyAsString(propertyname:String):String = {
		return getPropertyAsString(propertyname,"");
	}
}