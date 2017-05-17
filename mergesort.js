var example = [];
// 1million: 680.185ms / 10million : 8473.988ms / 
// 40million: CALL_AND_RETRY_LAST Allocation failed - process out of memory
// 50million: Segmentation fault: 11
for (var i = 0; i < 100000; i++){ 
	var rand = Math.floor(Math.random() * 100);
	example.push(rand);
}

console.time('mergeSort');
var ans = mergeSort(example);
console.timeEnd('mergeSort');

function mergeSort(list) {
	if (list.length === 1) return list;

	var mid = Math.floor(list.length / 2);
	var arrayLeft = list.slice(0, mid);
	var arrayRight = list.slice(mid, list.length);	

	return merge(mergeSort(arrayLeft), mergeSort(arrayRight));
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
	while (l < left.length){
		res.push(left[l]);
		l++;
	}
	while (r < right.length){
		res.push(right[r]);
		r++;
	}
	return res;
}


// SHIFT() : NOT A GOOD IDEA . . .

// function merge(left, right) {
//     var res = [];
//     while (left.length && right.length) {
//         if (left[0] >= right[0]) {
//             res.push(right.shift());
//         } else {
//             res.push(left.shift());
//         }
//     }
//     while (left.length){
//         res.push(left.shift());
//     }
//     while (right.length){
//         res.push(right.shift());
//     }
//     return res;
// }