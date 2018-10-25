/**
 * Copyright: Copyright (c) 2015-2020 
 *
 * @FileName: heapSort.js
 * @Description: 堆排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/10/24
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 */


function Heap(){
}

Heap.prototype = (function(){
  var maxSize = 100;
  var size = 0;
  var a = new Array(maxSize);
  for(let i of a){
      a[i] = 0;
  }
  var _shiftUp = function(i){
      while (i > 1) {
        if (a[i >> 1] > a[i]) {
            // swap(a[i >> 1], a[i]);
            let op = a[i >> 1] + a[i];// 3 = 1 + 2
            a[i] = op - a[i];// = 3 - 2
            a[i >> 1] = op - a[i];// = 3 - 1
            i = i >> 1;
        } else {
            break;
        }
    }
  };
  var _shiftDown = function(i,size){
      while ((i << 1) < size) {
        let t = i << 1;
        if (t <= size && a[t] > a[t + 1])
            t++;
        if (a[i] > a[t]) {
            // swap(a[i], a[t]);
            let op = a[i] + a[t];
            a[i] = op - a[i];
            a[t] = op - a[i];
            i = t;
        } else {
            break;
        }
    }
  }
  return {
    constructor:Heap,
    push:function(data){
      if(size >= maxSize){
        console.info('heap is full ...');
      }else{
        size ++;
        a[size] = data;
        console.info('push seccess ...')
        _shiftUp(size);
      }
    },
    pop:function(){
      let op = a[1];
      let op2 = a[1] + a[size];
      a[1] = op2 - a[1];
      a[size] = op2 - a[1];
      size --;
      _shiftDown(1,size);
      return op;
    },
    getArr:function(i){
      return a[i];
    },
    getSize:function(){
      return size;
    },
    setMaxSize:function(value){
      maxSize = value;
    }
  }
})();

function main(){
  let h = new Heap();
  h.setMaxSize(10);
  console.info(h)
  h.push(100);
  h.push(12);
  h.push(30);
  h.push(1);
  h.push(44);
  h.push(37);
  h.push(2);
  console.info(h.pop())
  console.info(h.pop())
  console.info(h.pop())
  console.info(h.pop())
  console.info(h.pop())
  console.info(h.pop())
  console.info(h.pop())
}
main();