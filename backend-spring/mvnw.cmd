@REM SFit Maven Wrapper script
@echo off
set "MAVEN_HOME=C:\Users\yashc\apache-maven-3.9.16"
if exist "%MAVEN_HOME%\bin\mvn.cmd" (
    "%MAVEN_HOME%\bin\mvn.cmd" %*
) else (
    mvn %*
)
