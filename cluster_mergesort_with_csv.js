var cluster = require('cluster');
var fs = require('fs');
var path = require('path');

if (cluster.isMaster) {
	fs.readFile(path.join(process.cwd(), '/example.csv'), 'utf8', function (err,fullList) {
	  if (err) return err;
	  var example = fullList.split('\r\n').map(Number);
	  console.log("EXAMPLE: ", example);
	
		console.time('mergeSort');
		const length = example.length; //i.e. Sorting 40million random integers with 4 workers: 412181.207ms
		const cpu = require('os').cpus().length;

		var res = [];
		var workers = [];

		for (var i = 0; i < cpu; i++) {
	    var worker = cluster.fork();
	    workers.push(worker);

	    // For tiny size
	    if (length < cpu) {
	    	var listPart = example.splice(0, length);
	  		workers[0].send({list: listPart});
	    }
	    else if (i == cpu - 1) {
	    	var listPart = example.splice(0, Math.floor(length/cpu + (length % cpu)));
	  		workers[i].send({list: listPart});
	    } else {
	    	var listPart = example.splice(0, Math.floor(length/cpu));
	  		workers[i].send({list: listPart});
	    }

	    workers[i].on('message', function(msg) {
	      res.push(msg);
	      if (res.length === cpu) {
	      	// Output : a csv file of sorted number
	      	var sortedArray = mergeByMaster(res, length);
	      	var output = fs.createWriteStream('result.csv');
					output.on('error', function(err) { return 'ERROR'; });
					output.write(sortedArray.join('\r\n'));
					output.end();
	      	console.log("SORTED : ", sortedArray)
	      	return;
	      }
	    });
	  }
  });
}
if (cluster.isWorker) {
  process.on('message', function(msg) {
    process.send(splitByWorkers(msg.list));
  });
}

// Merge sort will be performed by each worker with distributed workload.
function splitByWorkers(list) {
	if (list.length <= 1) return list;

	var mid = Math.floor(list.length / 2);
	var arrayLeft = list.slice(0, mid);
	var arrayRight = list.slice(mid, list.length);	

	return mergeByWorkers(splitByWorkers(arrayLeft), splitByWorkers(arrayRight));
}

function mergeByWorkers(left, right) {
	var res = [];
	var l = 0, r = 0;
	while (l < left.length && r < right.length) {
		if (left[l] >= right[r]) {
			res.push(right[r]);
			r++;
		} else {
			res.push(left[l]);
			l++;
		}
	}
	while (l < left.length) {
		res.push(left[l]);
		l++;
	}
	while (r < right.length) {
		res.push(right[r]);
		r++;
	}
	return res;
}

// When all workers return sorted subarrays, master will merge them to one sorted array.
function mergeByMaster(bigArr, length) {
	var result = [];
	var indexes = [];
	for (var i = 0; i < bigArr.length; i++) {
		indexes.push(0);
	}
	
	while (result.length < length) {
		var sub = [];
		for (var k = 0; k < bigArr.length; k++) {
			if (indexes[k] < bigArr[k].length) {
				sub.push(bigArr[k][indexes[k]]);
			} else {
				sub.push(Number.MAX_SAFE_INTEGER)
			}
		}
		result.push(Math.min(...sub));
		var indexOfMinValue = sub.reduce((iMin, cur, i, arr) => cur <= arr[iMin] ? i : iMin, 0);
		indexes[indexOfMinValue]++;
	}
	console.timeEnd('mergeSort');
	return result;
}

