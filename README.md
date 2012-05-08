node-worldbank
==============

Node client for the world bank API. As the world bank Api is already pretty nice this wrapper mainly serves the purpose of caching results as suggested by the world bank API documentation (http://data.worldbank.org/developers/api-overview). It supports 2 levels of caching, a file cache and a in memory cache. It falls back to the fastest available and uses a md5 hash of the request url as a key for the cache. It supports fetching data via regular callbacks as well as streams. Streams also work for cached results. 

###Usage

This is a how it could be used in an express application. there is a sample in the examples folder and the code has some comments 


	var worldbank = new Worldbank({cacheDir:__dirname+"/cache/"})
	/*
	Options: 	per_page // entries per page
				page // page number 1 … n
				date // date range start:end
	*/
	app.get("/get/:countries/:indicator",function(req,res,next){
	
		var options=req.query
	
			worldbank.get("/countries/"+req.params.countries+"/indicators/"+req.params.indicator,options,function(err,data){
				if(err){
					return next(err)
				}
				res.json(data);
			})

	})

	
	
	e.g: NY.GDP.PCAP.CD // GDP per Capita
	
	*/
	app.get("/stream/:countries/:indicator",function(req,res,next){
		
		var options=req.query
				
		worldbank.getStream("/countries/"+req.params.countries+"/indicators/"+req.params.indicator,options,function(err,stream){
			stream.pipe(res)
		})
	
	})



