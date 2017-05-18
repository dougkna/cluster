# Merge Sort Using Cluster

### Introduction

The lightweight, efficient Node.js sometimes comes at a cost of locking apps down to a single process.
Default cluster module in Node addresses this issue and allows us to parallel, multi-core environments.
One way to visualize this is to use merge sort using cluster.


### Specifications

##### mergesort.js

Basic merge sort. Benchmark is faster than cluster_mergesort, but since it is using a single process sorting a large(>40million integers) array will quickly run out of memory due to Node's default memory limit (512mb).

##### cluster_mergesort.js

Merge sort using cluster.  Master will (almost) equally distribute the original workload to its workers, each of which will perform its own merge sort.  Master will then merge the results to one sorted array.

##### cluster_mergesort_with_csv.js

Transform a csv file of numbers to a sorted file.

