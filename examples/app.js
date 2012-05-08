var express= require('express');
	app = express.createServer(),
	request = require('request'),
	Worldbank = require('../index')

/*

Options {
			useCache:true || false - default: true
			cacheDir: Directory - default: __dirname+"/cache/"
		}

*/

var worldbank = new Worldbank({cacheDir:__dirname+"/cache/"})

app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(app.router);
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.get("/get/:countries/:indicator",function(req,res,next){
	
	var options=req.query
	
	worldbank.get("/countries/"+req.params.countries+"/indicators/"+req.params.indicator,options,function(err,data){
		if(err){
			return next(err)
		}
		res.json(data);
	})

})

/*

e.g: NY.GDP.PCAP.CD // GDP per Capita

*/
app.get("/stream/:countries/:indicator",function(req,res,next){
	
	var options=req.query
			
	worldbank.getStream("/countries/"+req.params.countries+"/indicators/"+req.params.indicator,options,function(err,stream){
		stream.pipe(res)
	})

})
/*

Clear the cache

*/
app.get("/clear",function(req,res,next){
	worldbank.clearCache(function(){
		res.end("cache cleared")
	})
})




app.listen(8080)