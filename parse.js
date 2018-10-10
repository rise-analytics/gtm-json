
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
    this.filterKeys = []
    this.paramKeys = []
    this.init = function(){
        var keys = []
        var paramKeys = []
        var filterKeys = []
        for (let i=0;i<this.category.length;i++){
            Object.keys(this.category[i]).forEach(function(obj){
                keys.pushIfUnique(obj);
            })
            // checks to see if tag or variable
            if (this.category[i].searchTable("parameter") !== null){
                this.category[i].parameter.map(a => a.key).forEach(function(obj){
                    paramKeys.pushIfUnique(obj);
                });
            }
            // // checks to see if trigger
            if (this.category[i].searchTable("filter") !== null){
                this.category[i].filter.forEach(function(child){
                    Object.keys(child).forEach(function(obj){
                        filterKeys.pushIfUnique(obj);
                    })
                    child.parameter.map(a => a.key).forEach(function(obj){
                        paramKeys.pushIfUnique(obj);
                    });
                })
            }
        }
        this.keys = keys.filter(word => word !== "parameter" && word !== "filter")
        this.filterKeys = filterKeys.filter(word => word !== "parameter")
        this.paramKeys = paramKeys.sort()
        return "init done"
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
        iterateOverKeys(this.filterKeys, "|condition")
        iterateOverKeys(this.paramKeys)
        return columns
    }
    this.generateRows = function(){
        var rows = []
        for (let i=0;i<this.category.length;i++){
            var k = new Object()
            for (let j=0; j<this.keys.length;j++){
                let res = JSON.stringify(this.category[i].searchTable(this.keys[j])) !== "null" ? JSON.stringify(this.category[i].searchTable(this.keys[j])) : ""
                k[this.keys[j]] = res.split("\"").join("").split("[").join("").split("]").join("")
            }
            if (this.category[i].searchTable("parameter") !== null){
                this.category[i].searchTable("parameter").forEach(function(obj){
                    k[obj.searchTable("key")] = obj.searchTable("value")
                })
                rows.push(k)
            }
            if (this.category[i].searchTable("filter") !== null){
                this.category[i].searchTable("filter").forEach(function(child){
                    k["type|condition"] = child.searchTable("type")
                    child.searchTable("parameter").forEach(function(obj){
                        k[obj.searchTable("key")] = obj.searchTable("value")
                    })
                    rows.push(k)
                })
                rows.push(k)
            }
            rows.push(k)
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
    // trigger.generateCsv();

});