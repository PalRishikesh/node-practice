const express = require("express");
const ElasticSearch = require("elasticsearch");

const app = express();
const port = 3000;
app.use(express.json());

const esClient = new ElasticSearch.Client({
   host:'http://elastic:123456@localhost:9200',
   log:'trace' 
});

let indexName = 'rishi-index';


esClient.ping({requestTimeout:30000},(error)=>{
    if(error){
        console.error("ElasticSearch cluster is down!");
    }
    else{
        console.log("Elastic search cluster is up and running");
    }
});

async function createIndex(indexName){
    console.log("Runiiing.....");
    try{
        const response = await esClient.indices.create({
            index:indexName
        });
        console.log(`Index ${indexName} created successfully: `,response);
    }
    catch(error){
        console.error(`Error while creating index ${indexName}:`, error)
    }
}

// (async()=>{
//     await createIndex(indexName);
// })();


async function indexDocument(indexName, document){
    try {
        const response = await esClient.index({
            index : indexName,
            body: document,
        });
        console.log(`Document indexed in ${indexName}: `,response);
    } catch (error) {
        console.error("Error while indexing ",error)
    }
}


// (async()=>{
//     const exampleDocument = {
//         title: 'An Example Document',
//         content:'This is a sample document form indexing in Elastic Search.',
//         timestamp:new Date()
//     };
//     await indexDocument(indexName, exampleDocument);
// })();

async function searchDocuments(indexName, query){
    try {
        const response = await esClient.search({
            index:indexName,
            body:{
                query:query
            },
        });
        console.log(`Search results for ${indexName}: `,response.hits.hits);
    } catch (error) {
        console.error(`Error searching documents in ${indexName}`, error)
    }
}

const simpleQueryString = {
    simple_query_string:{
        query:'examples',
    },
};

// searchDocuments(indexName, simpleQueryString);

async function advanceSearchDocuments( title, notData){
    let notInclude = notData == undefined ? '':notData;  
    try {
        const response = await esClient.search({
            index:indexName,
            body:{
                query: {
                  bool: {
                    must: {
                      match: {
                        title: title
                      }
                    },
                    must_not: {
                      match: {
                        content: notInclude // body
                      }
                    }
                  }
                }
              }
        });
        console.log(`Search results for ${indexName}: `,response.hits.hits);
    } catch (error) {
        console.error(`Error searching documents in ${indexName}`, error)
    }
}




// advanceSearchDocuments('Document');

async function updateDocument(documentId,updateScript){
    try {
        const response = await esClient.update({
            index : indexName,
            id: documentId,
            body:{
                script: updateScript
            }
        });
        console.log(`Document updated in ${indexName}:` ,response);
    } catch (error) {
        console.error(`Error in updating document in ${indexName} : `,error )
        
    }
}

// (async()=>{
//     const documentId = 'eTRetIwBy3mhSxj9x_Au';
//     const updateScript = {
//         source: 'ctx._source.title = params.newTitle',
//         lang: 'painless',
//         params: { newTitle: 'Updated Example Document' },

//     };
//     await updateDocument(documentId, updateScript);

// })();

// Delete

async function deleteDocuments(documentId){
    try {
       const response = await esClient.delete({
        index:indexName,
        id:documentId
       });
       console.log(`Document deleted from '${indexName}':`, response);
    } catch (error) {
        console.error(`Error deleting document from '${indexName}':`, error);
    }
}

async function deleteIndex(){
    try {
       const response = await esClient.indices.delete({
        index:indexName
       }); 
       console.log(`Index '${indexName}' deleted successfully:`, response);
    } catch (error) {
        console.error(`Error deleting index '${indexName}':`, error);
    }
}
(async()=>{
    const documentId = 'eTRetIwBy3mhSxj9x_Au';
    // await deleteDocuments(documentId);
    // await deleteIndex();
});



app.post("/index",async(req,res)=>{
    console.log("req:",req.body);
    const response = await esClient.index({
        index : indexName,
        id:req.body.id,
        body: req.body,
    });
    return res.send("hi");
});


app.get("/index/:id",async(req,res)=>{
    console.log("req:",req.params.id);
    const response = await esClient.get({
        index : indexName,
        id:req.params.id,
    });
    console.log("response: ",response);
    return res.send(response._source);
});



app.listen(port,()=>{
    console.log(`Server is unning on port ${port}`);
});