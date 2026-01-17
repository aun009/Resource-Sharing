@echo off
java -jar target\demo-0.0.1-SNAPSHOT.jar --server.port=8084 --spring.datasource.url=jdbc:mysql://localhost:3306/skillswap_db --spring.datasource.username=root --spring.datasource.password=1212 --spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
pause
