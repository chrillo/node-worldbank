node-worldbank
==============

Node Library for the Worldbank API. As the Worldbank Api is already pretty nice this wrapper mainly serves the purpose of caching results as suggest by the Worldbank API documentation. It supports 2 Level of caching, a file cache and a in memory cache. It falls back to the fastest available and uses a md5 hash of the request url as a key for the cache. It supports fetching data via regular callbacks as well as streams, this also works for cached results. 

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



