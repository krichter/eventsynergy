package org.scalatra
package fileupload

import scala.language.postfixOps
import org.apache.commons.fileupload.servlet.ServletFileUpload
import org.apache.commons.fileupload.{FileItemFactory, FileItemStream}
import collection.JavaConversions._
import scala.util.DynamicVariable
import java.util.{List => JList, HashMap => JHashMap}
import collection.mutable.{ListBuffer,HashMap}
import collection.immutable.Stream;
import javax.servlet.http.{HttpServletRequestWrapper, HttpServletRequest, HttpServletResponse}
import collection.Iterable
import java.lang.String
import scala.io._;
import java.io._;

/**
 * This is a tweaked version of the one that can come with Scalatra. This allows for it to work on Google App Engine
 */

/** FileUploadSupport can be mixed into a [[org.scalatra.ScalatraFilter]] or [[org.scalatra.ScalatraServlet]] to provide easy access to data submitted
   * as part of a multipart HTTP request.  Commonly this is used for retrieving uploaded files.
   *
   * Once the trait has been mixed into your handler you can access any files uploaded using {{{ fileParams("myFile") }}} where ''myFile'' is the name
   * of the parameter used to upload the file being retrieved.
   *
   * @note Once any handler with FileUploadSupport has accessed the request, the fileParams returned by FileUploadSupport will remain fixed for
   * the lifetime of the request. */
trait FileUploadSupport extends ScalatraKernel {
	import FileUploadSupport._

	override def handle(req: HttpServletRequest, resp: HttpServletResponse) {
		val req2 =
			if (ServletFileUpload.isMultipartContent(req)) {
				val bodyParams = extractMultipartParams(req)
				wrapRequest(req, bodyParams.formParams)
			}
			else req
		super.handle(req2, resp)
	}
	
	private def b2s(a:Array[Byte]):String = new String(a,"UTF-8");

	private def extractMultipartParams(req: HttpServletRequest): BodyParams =
	// First look for it cached on the request, because we can't parse it twice.  See GH-16.
	req.get(BodyParamsKey).asInstanceOf[Option[BodyParams]] match {
		case Some(bodyParams) =>
			bodyParams
		case None =>
			val upload = new ServletFileUpload()
			var iterator = upload.getItemIterator(req);
			var items = new ListBuffer[FileItemStream]();
			var fileParams:HashMap[String,List[UploadedFile]] = new HashMap();
			var formParams:HashMap[String,List[String]] = new HashMap();
			while (iterator.hasNext()) {
				var item = iterator.next();
				var data = inputStreamToByteArray(item.openStream());
				if (item.isFormField()) {
					//println("Got a form field: " + item.getFieldName());
					formParams += ((item.getFieldName, new String(data,"UTF-8") :: formParams.getOrElse(item.getFieldName, List[String]())))
				} else {
					//println("Got an uploaded file: " + item.getFieldName() + ", name = " + item.getName());
					fileParams += ((item.getFieldName, UploadedFile(item.getName(),data) :: fileParams.getOrElse(item.getFieldName(), List[UploadedFile]())))
				}
			}
			
			req(BodyParamsKey) = BodyParams(fileParams.toMap,formParams.toMap)
			BodyParams(fileParams.toMap,formParams.toMap)
	}

	private def wrapRequest(req: HttpServletRequest, formMap: Map[String, Seq[String]]) =
		new HttpServletRequestWrapper(req) {
		override def getParameter(name: String) = formMap.get(name) map { _.head } getOrElse null
		override def getParameterNames = formMap.keysIterator
		override def getParameterValues(name: String) = formMap.get(name) map { _.toArray } getOrElse null
		override def getParameterMap = new JHashMap[String, Array[String]] ++ (formMap transform { (k, v) => v.toArray })
	}

	protected def fileMultiParams: FileMultiParams = extractMultipartParams(request).fileParams

	/** @return a Map, keyed on the names of multipart file upload parameters, of all multipart files submitted with the request */
	def fileParams = _fileParams

	protected val _fileParams = new collection.Map[String, UploadedFile] {
		def get(key: String) = fileMultiParams.get(key) flatMap { _.headOption }
		override def size = fileMultiParams.size
		override def iterator = fileMultiParams map { case(k, v) => (k, v.head) } iterator
		override def -(key: String) = Map() ++ this - key
		override def +[B1 >: UploadedFile](kv: (String, B1)) = Map() ++ this + kv
	}
	
	private def inputStreamToByteArray(is: InputStream): Array[Byte] = {
		val buf = ListBuffer[Byte]()
		var b = is.read()
		while (b != -1) {
			buf.append(b.byteValue)
			b = is.read()
		}
		buf.toArray
	}
}

object FileUploadSupport {
	case class BodyParams(fileParams: FileMultiParams, formParams: Map[String, List[String]])
	case class UploadedFile(filename:String,data:Array[Byte])
	type FileMultiParams = Map[String, List[UploadedFile]]
	private val BodyParamsKey = "org.scalatra.fileupload.bodyParams"
}




