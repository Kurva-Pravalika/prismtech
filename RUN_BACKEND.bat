@echo off
cd /d "%~dp0backend"
echo Starting CivicPulse Spring Boot API...
call mvnw.cmd spring-boot:run
pause
