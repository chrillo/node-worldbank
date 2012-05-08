var request = require('request'),
	qs 		= require('querystring'),
	fs 		= require('fs'),
	hash    = require('node_hash'),
	stream  = require('stream'),
	util 	= require('util'),
	async	= require('async');


/* Custom Stream Object so the memory cache can be serverd as a stream */

var  MemcacheStream = function(pattern) {
   this.writeable=true;
   stream.Stream.call(this)
}
util.inherits(MemcacheStream, stream.Stream);

	MemcacheStream.prototype.write = function(chunk,encoding){
		this.emit('data',chunk)
	}
	MemcacheStream.prototype.end =function(){
		this.emit('end')
	
	}
	
/*

Constructor

*/	

var Worldbank = function(options){
	this.host="http://api.worldbank.org"
	this.memoryCache={}
	this.options={per_page:100,useCache:true,cacheDir:__dirname+"/cache/"};
	
	for(var option in options){
		this.options[option]=options[option]
	}
	
	this.setupFileCache()
	
}
	

	/*
	
	Get data from an endpoint. if caching is enabled get it from the cache
	
	Options: 	per_page // entries per page
				page // page number 1 … n
				date // date range start:end
				
	
	*/
	
	Worldbank.prototype.get=function(endpoint,options,callback){
		var url	  = this.buildRequestUrl(endpoint,options),
			_this = this;
		
		if(this.useCache()){
			
			var data = this.getMemCache(url)
			if(data){
				callback(null,data)
				return;
			}
			return this.getFromFileCache(url,function(err,data){
				if(err){
					return _this.request(url,{},callback);
				}
				callback(null,data)
			})
			
		}	
		return _this.request(url,{},callback)
	}
	
	/*
	
	gets a stream to a resource which can be piped to a response for example
	
	the stream can either be: a MemcacheStream if the data is in memory
							  a file read Stream if the data is in the file cache
							  a http request returned by request
	*/
	
	Worldbank.prototype.getStream = function(endpoint,options,callback){
		
		var url	  = this.buildRequestUrl(endpoint,options),
			_this = this;
		if(this.useCache()){
		
			var data = this.getMemCache(url)
			if(data){
				var stream = new MemcacheStream();
				console.log("used mem cache stream")
				callback(null,stream)
				stream.write(JSON.stringify(data))
				stream.end()
				
				return;
			}
		
			this.getFileCacheReadStream(url,function(err,readStream){
				
				if(err){
					console.log("used request stream")
					callback(null,_this.request(url))
					return
				}
				console.log("used file cache stream")
				callback(null,readStream)
					var buffer="";
					readStream.on("data",function(data){
						buffer+=data
					})	
					readStream.on("end",function(){
						_this.setMemCache(url,JSON.parse(buffer))
					})
			})
			return	
		}
			
		var req=_this.request(url,{});
			if(callback){
				callback(null,req)
			}
		return req
	}
		

	
	/*
	
	Make the actual http request and fetch the data
	Returns the request object, could be piped directly to a response
	
	*/
	
	Worldbank.prototype.request=function(url,options,callback){
		var options = options || {}
		var _this	= this,
			noCache	= options.noCache || false;
			normalize= options.normalize || false;
		
		var req = request.get(url,{},function(err,response,body){
			
			if(err){
				callback(err,null)
				return
			}
			var data=JSON.parse(body)
				if(normalize){
					data=_this.normalizeRespones(normalize,data)
				}	
			
				if(_this.useCache() && !noCache){
						
					_this.setMemCache(url,data)
				}
			if(callback){
				callback(err,data)
			}
			
		})
		
		if(this.useCache() && !noCache){
			
			req.pipe(this.getFileCacheWriteStream(url))
			
		}
				
		return req
	
	}
	
	Worldbank.prototype.normalizeResponse=function(mode,data){
		try{
			mode = mode || "country"
			var dataset	= data[0],
				datalist= data[1]; 
			var normalized = {indicator:datalist[0].indicator.id,value:datalist[0].indicator.value}
				normalized[mode]={}	
				
			datalist.forEach(function(dataPoint){
				var id=dataPoint[mode].id
				if(!normalized[mode][id]){
					normalized[mode][id]={dates:{}}
				}
				normalized[mode][id].dates[dataPoint.date]=dataPoint.value
			})	
			return normalized
		}catch(e){
		
		}finally{
			return data
		}
	}
	/*
	
	checks if caching should be used
	
	*/
	
	Worldbank.prototype.useCache=function(){
		return this.options.useCache;
	}
	
	
	/*
	
	Clears the memory cache and the file cache
	
	*/
	
	Worldbank.prototype.clearCache=function(callback){
		this.clearMemCache()
		this.clearFileCache(callback)
	
	}
	
	/*
	
	Clears the memory cache
	
	*/
	
	Worldbank.prototype.clearMemCache=function(){
		this.memoryCache={}
	}
	
	/*
	
	Sets a chunk of data in the memory cache
	
	*/
	Worldbank.prototype.setMemCache=function(key,value){
		this.memoryCache[hash.md5(key)]=value
	}
	
	/*
	
	Gets an item from the memory cache
	
	*/
	Worldbank.prototype.getMemCache=function(key){
		return this.memoryCache[hash.md5(key)]
	}
	
	/*
	
	trys to create the file cache folder if it does not exist
	
	*/
	
	Worldbank.prototype.setupFileCache = function(){
		var _this = this;
		if(this.options.cacheDir){
			fs.stat(this.options.cacheDir,function(err,stat){
				if(err){
					fs.mkdir(_this.options.cacheDir,0777,function(err,dir){
						if(err){
							throw new Error("cache could not be created")
						}
					})
				}
				
			})
		}
	}
	
	/*
	
	Clears the File cache
	
	*/
	
	Worldbank.prototype.clearFileCache = function(callback){
		var _this = this
		fs.readdir(this.options.cacheDir, function(err, files) {
			
			if(files.length==0){
				
				if(callback){
					callback()
				}
				
			}
			var n=0;
			files.forEach(function(file){
				fs.unlink(_this.options.cacheDir+file,function(err){
					if(err){
						throw err
					}
					
					if(callback){
						if(n==files.length-1){
							
							callback()
						
						}
					}
					n++
				})
			})
		})
	}

	
	/*
	
	Get a write stream to the cache file
	
	*/
	
	Worldbank.prototype.getFileCacheWriteStream = function(url,callback){
		var file=hash.md5(url)	
		return fs.createWriteStream(this.options.cacheDir+file)
	}
	
	/*
	
	Load a page of data from the cache, if the file is not present the error is returned
	
	*/
	
	Worldbank.prototype.getFromFileCache = function(url,callback){

			var file = hash.md5(url),
				readStream = fs.createReadStream(this.options.cacheDir+file),
				buffer = "";
			
			if(callback){
				readStream.on("data",function(data){
					buffer+=data
				})
				readStream.on("end",function(){
					callback(null,JSON.parse(buffer.toString()))
				})
				readStream.on('error',function(err){
					callback(err,null)
				})
			}	
		
 		return readStream;
	}
	/*
	
	Checks if a file exists and returns a read stream if possible
	
	*/
	Worldbank.prototype.getFileCacheReadStream = function(url,callback){
		
		var file = hash.md5(url),_this=this
		
		fs.stat(this.options.cacheDir+file,function(err,filestat){
			if(err){
				callback(err,null)
				return
			}
			callback(null,fs.createReadStream(_this.options.cacheDir+file))
		})
	}
	
	/*
	
	Construct the request url from the host, endpoint and options
	
	*/
	
	Worldbank.prototype.buildRequestUrl=function(endpoint,options){
			options.format = options.format || "json"
			options.page = options.page || 1;
			options.per_page = options.per_page || this.options.per_page
			options=qs.stringify(options)
			
		return this.host+endpoint+"?"+options
	
	}
	




module.exports=Worldbank