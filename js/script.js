/*
MySQL Slow Query Log Visualizer
By Geoff Gaudreault (http://www.neurofuzzy.net)

Many thanks to:

List.js author Jonny Strömberg (www.jonnystromberg.se, www.listjs.com)
https://github.com/javve/list

jQuery Visualize author Scott Jehl, Filament Group scott@filamentgroup.com
https://github.com/filamentgroup/jQuery-Visualize

License (MIT)

Copyright (c) 2011 Geoff Gaudreault http://www.neurofuzzy.net

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, and/or sell copies of the Software,
and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

function processLog (logtext)
{
    var log_entry;
    var log_lines;
    var date_string;
    var entry_stats;
    
    //logdata = logtext.split("# User@Host: ");
    logdata = logtext.split("# Time: ");
    logdata.shift();

    for (var i = 0; i < logdata.length; i++) {

        /* 0 # Time: 2024-06-04T21:00:13.552215Z
        // 1 # User@Host: user[pass] @  [10.0.0.1]  Id: 78417468
        // 2 # Schema: ccdb  Last_errno: 0  Killed: 0
        // 3 # Query_time: 10.415087  Lock_time: 0.000845  Rows_sent: 3  Rows_examined: 329626  Rows_affected: 0  Bytes_sent: 6454
        // 4 SET timestamp=1717534813;
        // 5 SELECT 

        // 0 # Time: 2024-06-04T21:01:18.105252Z
        // 1 # User@Host: user[pass] @  [10.0.0.1]  Id: 73322256
        // 2 # Schema: diego  Last_errno: 0  Killed: 0
        // 3 # Query_time: 12.462617  Lock_time: 0.000316  Rows_sent: 19143  Rows_examined: 38286  Rows_affected: 0  Bytes_sent: 679603003
        // 4 use diego;
        // 5 SET timestamp=1717534878;
        // 6 SELECT
 
        0 # Time: 2024-06-11T10:16:33.035025Z
        1 # User@Host: user[pass] @  [10.0.0.1]  Id:  Id: 3243312
        2 # Schema: diego  Last_errno: 0  Killed: 0"
        3 # Query_time: 16.503651  Lock_time: 0.000000  Rows_sent: 0  Rows_examined: 0  Rows_affected: 0  Bytes_sent: 52
        4 # Tmp_tables: 0  Tmp_disk_tables: 0  Tmp_table_sizes: 0
        5 # InnoDB_trx_id: 9C5C92E9B
        6 # Full_scan: No  Full_join: No  Tmp_table: No  Tmp_table_on_disk: No
        7 # Filesort: No  Filesort_on_disk: No  Merge_passes: 0
        8 #   InnoDB_IO_r_ops: 0  InnoDB_IO_r_bytes: 0  InnoDB_IO_r_wait: 0.000000
        9 #   InnoDB_rec_lock_wait: 0.000000  InnoDB_queue_wait: 0.000000
        10 #   InnoDB_pages_distinct: 3"
        11 SET timestamp=1718100976;"
        12 SELECT

        0 # Time: 2024-06-11T10:16:34.309646Z
        1 # User@Host: user[pass] @  [10.0.0.1]  Id:  Id: 3243277
        2 # Schema: diego  Last_errno: 0  Killed: 0
        3 # Query_time: 18.144152  Lock_time: 0.000000  Rows_sent: 0  Rows_examined: 0  Rows_affected: 0  Bytes_sent: 11
        4 # Tmp_tables: 0  Tmp_disk_tables: 0  Tmp_table_sizes: 0
        5 # Full_scan: No  Full_join: No  Tmp_table: No  Tmp_table_on_disk: No
        6 # Filesort: No  Filesort_on_disk: No  Merge_passes: 0
        7 # No InnoDB statistics available for this query     
        8 use diego;
        */

        
        // load string
        log_entry = logdata[i];
        logdata[i] = {};
        
        log_lines = log_entry.split("\n");
       
        // get host
        logdata[i].db_name = log_lines[2].split(" ")[3];
       
        // get stats
        entry_stats = log_lines[3].split(" ");
        logdata[i].query_time = entry_stats[2]; // query time
        logdata[i].lock_time = entry_stats[4]; // lock time
        logdata[i].rows_sent = entry_stats[6]; // rows sent
        logdata[i].rows_examined = entry_stats[8]; // row examined

        if (log_lines[4].substr(0,12) == "# Tmp_tables") {
            log_lines.shift();  // # Tmp_tables: 0  Tmp_disk_tables: 0  Tmp_table_sizes: 0
                                // # InnoDB_trx_id: 9C5C92E9B ### only if statitics are there
            log_lines.shift();  // # Full_scan: No  Full_join: No  Tmp_table: No  Tmp_table_on_disk: No
            log_lines.shift();  // # Filesort: No  Filesort_on_disk: No  Merge_passes: 0 

            if (log_lines[4] == "# No InnoDB statistics available for this query" ) {
                log_lines.shift(); // # No InnoDB statistics available for this query
            } else {
                log_lines.shift(); // # Filesort: No  Filesort_on_disk: No  Merge_passes: 0
                log_lines.shift(); // #   InnoDB_IO_r_ops: 0  InnoDB_IO_r_bytes: 0  InnoDB_IO_r_wait: 0.000000
                log_lines.shift(); // #   InnoDB_rec_lock_wait: 0.000000  InnoDB_queue_wait: 0.000000
                log_lines.shift(); // #   InnoDB_pages_distinct: 3"
                
            }            
        }

        if (log_lines[4].substr(0,3) == "use") {
            log_lines.shift(); 
        }

        
        //console.log(log_entry);
        //console.log(log_lines[4]);
        date_string = log_lines[4].split("SET timestamp=")[1].split(";")[0];
        
        // parse date
        d = new Date(date_string * 1000);
        
        var year = d.getFullYear();
        
        var month = (d.getUTCMonth() + 1) + "";
        if (month.length == 1) month = "0" + month;
        
        var day = d.getUTCDate().toString();
        if (day.length == 1) day = "0" + day;
        
        var dayOfWeek = d.getUTCDay();
        
        var hours = d.getUTCHours().toString();
        if (hours.length == 1) hours = "0" + hours;
        
        var mins = d.getUTCMinutes().toString();
        if (mins.length == 1) mins = "0" + mins;
        
        date_string = year + "/" + month + "/" + day + " " + hours + ":" + mins;
        
        logdata[i].dateObj = d; // date
        logdata[i].date = date_string;
        logdata[i].hour = hours;
        
        // isolate query
        
        log_lines.shift();
        log_lines.shift();
        log_lines.shift();
        log_lines.shift();
        log_lines.shift();
        
        logdata[i].query_string = log_lines.join("\n").split("# Time: ")[0]; // query
        
        // time stats
        
        if (timedata[dayOfWeek][hours] == null) {
            timedata[dayOfWeek][hours] = 0;
        }
        
        timedata[dayOfWeek][hours]++;
        
    }
    
    return logdata.length;
}

function createList ()
{
    var options = {
        item: 'log_list_item',
        maxVisibleItemsCount: 3000
    }
    
    list = new List('log_list', options, logdata);
    
    document.getElementById('drop_zone').style.display = 'none';
    document.getElementById('log_list').style.display = 'table';

    var options2 = {
        item: 'time_list_item'
    }
    list2 = new List('time_list', options2, timedata);
    
    $("#log_list_search").keyup(updateTimeChart);
}

function createChart() {
    $('table#time_list tfoot').remove();
    $('table#time_list').visualize({
        type: 'line', 
        width: (window.innerWidth - 200) + 'px', 
        height: '400px'
    }).appendTo('#chart').trigger('visualizeRefresh');
    document.getElementById('time_list').style.display = 'none';
}

function updateTimeChart () {
    
    var count = 0;
    var is = list.items;
    var dayOfWeek;
    
    var hours;
    for (var d = 0; d < 7; d++) {
        for (var hour in timedata[d]) {
            timedata[d][hour] = 0;
        }
        timedata[d].dayName = dayNames[d];
    }
    
    for (var i = 0, il = is.length; i < il && i < 300000; i++) {
        if (
            (list.filtered && list.searched && is[i].found && is[i].filtered) ||
            (list.filtered && !list.searched && is[i].filtered) ||
            (!list.filtered && list.searched && is[i].found) ||
            (!list.filtered && !list.searched)
            ) {
            var obj = is[i].values();
            hours = obj.hour;
            dayOfWeek = obj.dateObj.getDay();
            timedata[dayOfWeek][hours]++;
            count++;
        }
    }
    $("#search_count").text(count + " results ");
    for (d = 0; d < 7; d++) {
        list2.items[d].values(timedata[d]);
    }
    $('.visualize').trigger('visualizeRefresh');
}

function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    var files = evt.dataTransfer.files; // FileList object.

    // files is a FileList of File objects. List some properties.
    var output = [];
    var f = files[0];

    output.push('<strong>', f.name, '</strong> (', f.type || 'n/a', ') - ',
        f.size, ' bytes');

    document.getElementById('drop_result').innerHTML = '<h2>Loading ' + output.join('') + '</h2>';


    var reader = new FileReader();
    
    // Closure to capture the file information.
    reader.onloadend = function(e) {
        if (e.target.readyState == FileReader.DONE) {
            var len = processLog(e.target.result);
            var span = document.createElement('span');
            span.innerHTML = "Imported " + len + " entries.";
            document.getElementById('load_result').insertBefore(span, null);
            createList();
            try {
                createChart();
            } catch (error) {
                console.log(error);
            }
        }
    };

    // Read in the image file as a data URL.
    reader.readAsText(f);
}

function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
}

function start() {
    // Setup the dnd listeners.
    var dropZone = document.getElementById('drop_zone');
    dropZone.addEventListener('dragover', handleDragOver, false);
    dropZone.addEventListener('drop', handleFileSelect, false);
}

var logdata = [];
var timedata = [];
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
for (var i = 0; i < 7; i++) {
    timedata[i] = {};
    timedata[i].dayName = dayNames[i];
}
var list;
var list2;