/**
 * Copyright: Copyright (c) 2015-2020 honglian
 *
 * @FileName: bubbleSort.js
 * @Description: 冒泡排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/10/23
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 *
 */

function init(){
  let a = [2,3,43,23,12,44,99];
  return a;
};

function sort(arr){
  for(let i = 0;i < arr.length;i++){
    for(let j = i + 1;j < arr.length - 1 - i ;j++){
        if(arr[i] > arr[j]){
          let temp = arr[i];
          arr[i] = arr[j];
          arr[j] = temp;
        }
        console.info(arr)
    }
  }
  console.info(arr);
  return arr;
};

function main(){
  let data = init();
  let result = sort(data);
}

main();