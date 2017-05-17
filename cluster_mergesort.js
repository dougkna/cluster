var cluster = require('cluster');

console.time('mergeSort');
if (cluster.isMaster){
	const length = 1000000;

	const cpu = require('os').cpus().length;
	var example = [];
	for (var i = 0; i < length; i++){
		var rand = Math.floor(Math.random() * 100);
		example.push(rand);
	}
	//console.log("EXAMPLE: ", example)

	var ans = [];
	var workers = [];

	for (var i = 0; i < cpu; i++) {
    var worker = cluster.fork();
    workers.push(worker);

    workers[i].on('message', function(msg) {
      ans.push(msg);
      if (ans.length === cpu) {
      	//console.log("SORTED ARRAY: ", mergeByMaster(ans, length));
      	return mergeByMaster(ans, length)
      }
    });

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
  }
}
if (cluster.isWorker) {
  process.on('message', function(msg) {
    process.send(split(msg.list));
  });
}

function split(list) {
	if (list.length <= 1) return list;

	var mid = Math.floor(list.length / 2);
	var arrayLeft = list.slice(0, mid);
	var arrayRight = list.slice(mid, list.length);	

	return merge(split(arrayLeft), split(arrayRight));
}

function merge(left, right) {
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
		var indexOfMinValue = sub.reduce((iMin, cur, i, arr) =>
			cur <= arr[iMin] ? i : iMin, 0);
		indexes[indexOfMinValue]++;
	}
	console.timeEnd('mergeSort');
	return result;
}

