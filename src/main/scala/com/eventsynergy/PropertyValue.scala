package com.eventsynergy

class PropertyValue(startval:Object) {
	var theval = startval;
	
	override def toString():String = {
		if (theval.isInstanceOf[com.google.appengine.api.datastore.Text]) {
			return theval.asInstanceOf[com.google.appengine.api.datastore.Text].getValue
		} else {
			return theval.toString()
		}
	}
	
	def getPropertyValue():String = {
		return this.toString();
	}
}