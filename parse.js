
const fs = require('fs')
const myArgs = process.argv
const fileName = process.argv[2]
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

Object.prototype.searchTable = function(toFind){
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            if (key === toFind){
                return this[key];
            }
        }
    }
    return null;
}
Array.prototype.pushIfUnique = function(toAdd){
    if (this.indexOf(toAdd) === -1){
        this.push(toAdd)
    }
}

function csv(category, filepath){
    this.category = category
    this.filepath = filepath
    this.keys = []
    this.keys_1 = []
    this.keys_2 = []
    this.init = function(){
        var keys = []
        var keys_1 = []
        var keys_2 = []
        for (let i=0;i<this.category.length;i++){
            Object.keys(this.category[i]).forEach(function(obj){
                keys.pushIfUnique(obj);
            })
            for (let j in this.category[i]) {
                if (typeof this.category[i][j] == "object") {
                    for (let k in this.category[i][j]){
                        if (this.category[i][j][k].hasOwnProperty("key")){
                            keys_1.pushIfUnique(this.category[i][j][k].searchTable("key"))
                        } else {
                            if (typeof this.category[i][j][k] == "object"){
                                for (let l in this.category[i][j][k]){
                                    for (let m in this.category[i][j][k][l]){
                                        if (this.category[i][j][k][l][m].hasOwnProperty("key")){
                                            keys_2.pushIfUnique(j +"|"+ this.category[i][j][k][l][m].searchTable("key"))
                                        } 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        this.keys = keys.filter(word => word !== "parameter")
        this.keys_1 = keys_1.sort().filter(word => word !== "parameter")
        this.keys_2 = keys_2.sort()
        return
    }
    this.generateColumns = function(){
        var columns = {
            path: this.filepath,
            header: []
        }
        function iterateOverKeys(colKeys, trig=false){
            let flag = trig === false ? "" : trig
            for (let i=0;i<colKeys.length;i++){
                var k = new Object()
                k['id'] = colKeys[i] + flag
                k['title'] = colKeys[i] + flag
                columns.header.push(k)
            }
        }
        iterateOverKeys(this.keys)
        iterateOverKeys(this.keys_1)
        iterateOverKeys(this.keys_2)
        return columns
    }
    this.generateRows = function(){
        var rows = []
        for (let i=0;i<this.category.length;i++){
            var r = new Object()
            for (let j=0; j<this.keys.length;j++){
                if (this.category[i].searchTable(this.keys[j]) !== null){
                    if (this.category[i].searchTable(this.keys[j]).hasOwnProperty("value")){
                        r[this.keys[j]] = this.category[i].searchTable(this.keys[j]).value
                    } else {
                        r[this.keys[j]] = JSON.stringify(this.category[i].searchTable(this.keys[j])).split("{\"").join("").split("\"}").join("").split("\"").join("").split("]").join("").split("[").join("")
                    }
                    rows.pushIfUnique(r)
                }
            }
            for (let j in this.category[i]){
                if (typeof this.category[i][j] == "object"){
                    for (let k in this.category[i][j]){
                        if (this.category[i][j][k].hasOwnProperty("key")){
                            r[this.category[i][j][k].searchTable("key")] = this.category[i][j][k].searchTable("value")
                        } else {
                            if (typeof this.category[i][j][k] == "object"){
                                for (let l in this.category[i][j][k]){
                                    r[j] = this.category[i][j][k].searchTable("type")
                                    for (let m in this.category[i][j][k][l]){
                                        if (this.category[i][j][k][l][m].hasOwnProperty("key")){
                                            r[(j +"|"+ this.category[i][j][k][l][m].searchTable("key"))] = this.category[i][j][k][l][m].searchTable("value")
                                        } 
                                        rows.pushIfUnique(r)
                                    }
                                    rows.pushIfUnique(r)
                                }
                            }
                            rows.pushIfUnique(r)
                        }
                        rows.pushIfUnique(r)
                    }
                }
            }
        }
        return rows
    }
    this.generateCsv = function(){
        this.init()
        var audit = createCsvWriter(this.generateColumns())
        audit.writeRecords(this.generateRows()).then(() => {
            console.log('...csv complete');
        });
        return
    }
}

fs.readFile(fileName, 'utf8', function(err, data) {
	const container = JSON.parse(data);
    let tag = new csv(container.containerVersion.tag, 'tag_audit.csv')
    let trigger = new csv(container.containerVersion.trigger, 'trigger_audit.csv')
    let variable = new csv(container.containerVersion.variable, 'variable_audit.csv')

    tag.generateCsv();
    variable.generateCsv();
    trigger.generateCsv();
});