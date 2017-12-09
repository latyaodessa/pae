module.exports = function (router) {

    const indexName = "test8";
    const indexType = "document";

    let request = require('request');
    let querystring = require('querystring');
    let elasticsearch = require('elasticsearch');


    let indexMapping = {
        "properties": {
            "Name": {
                "type": "text",
                "analyzer": "keyword",
                "fields": {
                    "raw": {
                        "type": "keyword"
                    }
                }
            },
            "EntityType": {
                "type": "text",
                "analyzer": "english",
                "fields": {
                    "raw": {
                        "type": "keyword"
                    }
                }
            },
            "EntityPosition": {
                "type": "long"
            },
            "Relevance": {
                "type": "integer"
            },
            "SentenceStartIndex": {
                "type": "long"
            },
            "SentenceEndIndex": {
                "type": "long"
            },
            "SentimentScore": {
                "type": "integer"
            },
            "PositiveAspectsCount": {
                "type": "integer"
            },
            "NegativeAspectsCount": {
                "type": "integer"
            },
            "NeutralAspectsCount": {
                "type": "integer"
            },
            "EntitySource": {
                "type": "text",
                "analyzer": "english",
                "fields": {
                    "raw": {
                        "type": "keyword"
                    }
                }
            },
            "Aspects": {
                "properties": {
                    "AspectName": {
                        "type": "text",
                        "analyzer": "english",
                        "fields": {
                            "raw": {
                                "type": "text"
                            }
                        }
                    },
                    "AspectSentiment": {
                        "type": "integer"
                    },
                    "AspectPosTag": {
                        "type": "text",
                        "analyzer": "keyword",
                        "fields": {
                            "raw": {
                                "type": "keyword"
                            }
                        }
                    },
                    "EntityDirectAspect": {
                        "type": "boolean"
                    }
                }
            }
        }
    };

    let client = new elasticsearch.Client({
        host: 'localhost:9200',
        log: 'trace'
    });

    client.ping({
        // ping usually has a 3000ms timeout
        requestTimeout: 1000
    }, function (error) {
        if (error) {
            console.trace('elasticsearch cluster is down!');
        } else {
            console.log('All is well');
        }
    });


    router.post('/save', function (req, res) {

        /// delete all indexes
        client.indices.delete({
            index: '_all'
        }, function (err, res) {

            if (err) {
                console.error(err.message);
            } else {
                console.log('Indexes have been deleted!');
            }
        });

        // create index

        client.indices.create({
            index: indexName,
            body: {
                "mappings": {
                    "document": {
                        indexMapping
                    }
                }
            }
        }, function (err, resp, respcode) {
            console.log(err, resp, respcode);
        });


        let formData = querystring.stringify({lang: req.body.lang, q: req.body.q});


        request({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: "http://emental.cs.univie.ac.at:8080/GateWS/ask?",
            body: formData,
            method: 'POST'
        }, function (err, response, body) {

            let counter = 1;

            JSON.parse(body).EntitySet.map(entity => {

                client.create({
                    index: indexName,
                    type: indexType,
                    id: counter,
                    body: entity,
                }, function (error, response) {
                    console.log(error);
                    console.log(response);
                });

                counter++;
            });

            res.json(JSON.parse(body));

        });
    });


    router.post('/search', function (req, res) {


        let formData = querystring.stringify({lang: req.body.lang, q: req.body.q});


        request({
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            uri: "http://emental.cs.univie.ac.at:8080/GateWS/ask?",
            body: formData,
            method: 'POST'
        }, function (err, response, body) {


            let arrayMatch = [];

            JSON.parse(body).EntitySet.map(entity => {
                console.log(entity);
                arrayMatch.push({"match": {"Name": entity.Name}});
            });


            let query = {
                "query": {
                    "bool": {"should": arrayMatch}
                }
            };


            client.search({
                index: indexName,
                type: indexType,
                body: query
            }).then(function (resp) {
                let hits = resp.hits.hits[0]._source.Aspects;
                res.json(hits);

            }, function (err) {
                console.trace(err.message);

            });


        });
    });


};