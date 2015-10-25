name := "eventsynergy"

version := "8"

scalaVersion := "2.10.4"

ivyScala := ivyScala.value map { _.copy(overrideScalaVersion = true) }

//seq(webSettings :_*)

fork := true

classpathTypes ~= (_ + "orbit")

resolvers += "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots"

unmanagedBase <<= baseDirectory { base => base / "custom_lib" }

libraryDependencies ++= Seq(
  "org.scalatra" %% "scalatra" % "2.0.5",
  "org.scalatra" %% "scalatra-scalate" % "2.0.5",
  "org.scalatra" %% "scalatra-fileupload" % "2.0.5",
  "org.scalatra" %% "scalatra-specs2" % "2.0.5" % "test",
  "ch.qos.logback" % "logback-classic" % "1.1.3" % "runtime",
  "org.eclipse.jetty" % "jetty-webapp" % "8.1.7.v20120910" % "container;test",
  "net.liftweb" %% "lift-json" % "2.6.2",
  "org.eclipse.jetty.orbit" % "javax.servlet" % "3.0.0.v201112011016" % "container;provided;test" artifacts (Artifact("javax.servlet", "jar", "jar")),
  "org.apache.commons" % "commons-lang3" % "3.3.2"
)

resolvers += "Sonatype OSS Snapshots" at "https://oss.sonatype.org/content/repositories/snapshots"

appengineSettings