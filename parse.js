
const fs = require('fs')

const myArgs = process.argv
const fileName = process.argv[2]
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
// tags, variables, trigger

// var tag_audit = createCsvWriter({
//     path: 'tag_audit.csv',
//     header: [
//         // {id: 'name', title: 'NAME'},
//         // {id: 'lang', title: 'LANGUAGE'}
//     ]
// });
 
var tags = [
    // {name: 'Bob',  lang: 'French, English'},
    // {name: 'Mary', lang: 'English'}
];

function searchTable(table, toFind){
    for (var k in table) {
        // use hasOwnProperty to filter out keys from the Object.prototype
        if (table.hasOwnProperty(k)) {
            if (k === toFind){
                return table[k];
            }
        }
    }
    return null;
}

function generateColumn(category, filepath){
    let sortKeys = function(){
        var keys = []
        for (let i=0;i<category.length;i++){
            var newKey = category[i].parameter.map(a => a.key);
            for (var j=0;j<newKey.length;j++){
                if (keys.indexOf(newKey[j]) === -1){
                    keys.push(newKey[j])
                }
            }
        }
        return keys.sort()
    }
    let audit = {
        path: filepath,
        header: []
    }
    for (let i=0;i<sortKeys().length;i++){
        var k = new Object()
        k['id'] = sortKeys()[i]
        k['title'] = sortKeys()[i]
        audit.header.push(k)
    }
    return audit
}

fs.readFile(fileName, 'utf8', function(err, data) {
	const container = JSON.parse(data);
    let tag = container.containerVersion.tag
    let trigger = container.containerVersion.trigger
    let variable = container.containerVersion.variable

    var tag_audit = createCsvWriter(generateColumn(tag, 'tag_audit.csv'))
    tag_audit.writeRecords(tags).then(() => {
        console.log('...Done');
    });
});

 
// "trigger": [
//             {
//                 "accountId": "27543852",
//                 "containerId": "845817",
//                 "triggerId": "167",
//                 "name": "All US Pages - DOM Ready",
//                 "type": "DOM_READY",
//                 "filter": [
//                     {
//                         "type": "CONTAINS",
//                         "parameter": [
//                             {
//                                 "type": "TEMPLATE",
//                                 "key": "arg0",
//                                 "value": "{{Page Hostname}}"
//                             },
//                             {
//                                 "type": "TEMPLATE",
//                                 "key": "arg1",
//                                 "value": "atkins.com"
//                             }
//                         ]
//                     }
//                 ],
//                 "fingerprint": "1472743188945"
//             },


