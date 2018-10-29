/**
 * Copyright: Copyright (c) 2015-2020 
 *
 * @FileName: shellSort.js
 * @Description: 希尔排序
 * @version: v1.0.0
 * @author: wantu
 * @date: 2018/10/29
 *
 * Modification History:
 * Date         Author          Version            Description
 *---------------------------------------------------------*
 *
 */

function doSort(a){
  let len = a.length;
  //stepSize 步长 其实就是不断的将一个数组划分为步长为stepSize的若干个子数组
  for(let stepSize = len>>1;stepSize > 0 ;stepSize = stepSize >> 1){
    //第一次步长为5 ，那么划分后的子数组为：0-5 1-6 2-7 3-8 4-9  5个子数组
    //第二次步长为2，那么划分后的子数组为：0-2-4-6-8 和1-3-5-7-9 2个子数组
    //第三次步长为1，那么划分后的子数组为：0-1-2-3-4-5-6-7-8-9   1个子数组
    for(let i = stepSize;i<len;i++){
      //对每个子数组进行排序
      //这个地方要理解一个东西，比如说现在i是5,stepSize = 2,
      //那么a[j](a[3])要是大于a[j](a[3+2]),两者交换，交换完之后j-= 2,所以a[3]是会和a[1]也会进行比较的。
      //最好自己模拟一下加深一下印象
      for(let j = i - stepSize;j >= 0&& a[j] >= a[j+stepSize];j-=stepSize){
        let temp = a[j];
        a[j] = a[j+stepSize];
        a[j+stepSize] = temp;
      }
    }
  }
  console.info(a);
}

 function main(){
    let arr = [23,33,12,67,9,14,35,2,333,45];
    doSort(arr);
 }

 main();