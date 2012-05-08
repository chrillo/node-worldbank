var Worldbank = require('../index'),
	shoud 	  = require('should')

describe('Worldbank Api', function(){
  var worldbank = new Worldbank();
  	  endpoint="/countries/all/indicators/NY.GDP.PCAP.CD"	
 
  beforeEach(function(done){
   		worldbank.clearCache(function(){
   			done()
   		})
  })	


  describe('get',function(){
  	
  	it('should fetch data and write it to cache',function(done){
  	
  			worldbank.get(endpoint,{},function(err,data){
  					
  					if(err){
  						throw err
  					}
  					if(data){
  						
  						data.should.be.a('object')
  					
  						var url=worldbank.buildRequestUrl(endpoint,{})
  						
  						var memdata=worldbank.getMemCache(url)
  							memdata.should.be.a('object')
  							
  							worldbank.getFromFileCache(url,function(err,filedata){
  							
  								filedata.should.be.a('object')
  								done() 
  							
  							})
  						
  					}else{
  						throw new Error("no data")
  					}
  	
  			})  			
  	
  	})
  	
  
  })

	
  describe('get without cache',function(){
  	
  	it('should fetch and return data without using the cache',function(done){
  				
  			worldbank.options.useCache=false;
  			worldbank.get(endpoint,{},function(err,data){
  				if(err){
  					throw err
  				}
  				if(data){
  					data.should.be.a("object")
  					worldbank.options.useCache=true;
  					done()
  				}else{
  					throw new Error("no data")
  				}
  					
  			})
  		
  	})
  
  })
 

  describe('getSream',function(){
  

  	it('should return a stream object',function(done){
  			
  	   		worldbank.getStream(endpoint,{},function(err,request){
  	   			
  	   			request.should.be.a("object")
  	   			request.should.have.property("host")
  	   			request.on("end",function(){
  	   				setTimeout(function(){
  	   					worldbank.getStream(endpoint,{},function(err,cacheStream){
  	   						
  	   						cacheStream.should.have.property("writeable")
  	   						cacheStream.should.be.a("object")
  	   						
  	   						cacheStream.on("end",function(){
  	   							
  	   							worldbank.clearMemCache();
  	   							
  	   							worldbank.getStream(endpoint,{},function(err,fileStream){
  	   								
  	   								fileStream.should.be.a("object")
  	   								fileStream.should.have.property("path")
  	   								fileStream.on("end",function(){
  	   								
  	   									done()
  	   								})
  	   								
  	   							
  	   							})
  	   						})
  	   					
  	   					})
  	   				},500)
  	   			})
  	   			
  	   		})
  			
  	})
  
  })



  

  
  
  
})