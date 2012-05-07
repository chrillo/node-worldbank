var request = require('request'),
	qs 		= require('querystring'),
	fs 		= require('fs');


var Worldbank = function(options){
	this.host="http://api.worldbank.org"
	
	this.defaults={per_page:100,useCache:true,cacheDir:__dirname+"/cache/"};
	
	for(option in options){
		this.defaults[option]=options[option]
	}
}
	

	/*
	
	Get data from an endpoint. if caching is enabled get it from the cache
	
	Options: 	per_page // entries per page
				page // page number 1 … n
				date // date range start:end
				noCache // disables disk cache
	
	*/
	
	Worldbank.prototype.get=function(endpoint,options,callback){
		//http://api.worldbank.org/countries/all/indicators/NY.GDP.PCAP.CD?date=2007:2011&per_page=100&format=json";
		var url=this.buildRequestUrl(endpoint,options),_this=this;
		
		if(this.useCache && !options.noCache){
			this.getFromCache(url,function(err,data){
				if(err){
					_this.request(url,callback)
				}
			})
			return;
		}	
	
		return _this.request(url,callback)
		
	}
	
	/*
	
	TODO: implement batch get function that fetches a bunch of pages and combines the results
	
	*/
		
	Worldbank.prototype.batchGet=function(endpoint,options,callback){
		
		
	
	
	}
	
	/*
	
	Make the actual http request and fetch the data
	Returns the request object, could be piped directly to a response
	
	*/
	
	Worldbank.prototype.request=function(url,callback){
		
		var _this=this
		
		var req = request.get(url,{},function(err,response,body){
			 
			if(callback){	
				callback(err,JSON.parse(body))
			}
			if(_this.useCache){
				_this.putToCache(url,data)
			}
			
		})
		
		return req
	
	}
	/*
	
	Save a page of data to the cache with url as key
	
	*/
	
	Worldbank.prototype.putToCache = function(url,data,callback){
		
		fs.writeFile(this.cacheDir+url, data, callback); 
		
	}
	
	/*
	
	Load a page of data from the cache, if the file is not present the error is returned
	
	*/
	
	Worldbank.prototype.getFromCache = function(url,callback){
		

		fs.readFile(this.cacheDir+url, function(err,data){
			  	
			  if(err) {
			  	callback(err,null)
			   	return;
			  }
			  callback(null,data)
			  
		});
 
	}
	
	/*
	
	
	Construct the request url from the host, endpoint and options
	
	
	*/
	
	Worldbank.prototype.buildRequestUrl=function(endpoint,options){
	
			options.page = options.page || 1;
			options.per_page = options.per_page || this.defaults.per_page
			options=qs.stringify(options)
			
		return this.host+endpoint+"?"+options
	
	}
	

	


module.exports=Worldbank