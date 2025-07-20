<template>
  <div class="donate">
    <h1>赛博要饭</h1>
    <p class="donate-img">
      <img :src="donate" width="300" alt="" srcset="" />
    </p>
    <p class="donate-img">买了A股股票亏了很多钱,工作也卷,现在只能要饭了。</p>
    <p class="donate-img">工作也卷,现在只好要饭了。</p>
    <p class="donate-img">
      上市公司董事长挪用13亿投资其他产业,拒不还钱当老赖,资产也没要回来。A股一点保障都没有
    </p>
    <p class="donate-img">
      <img :src="img1" alt="" srcset="" />
      <img :src="img2" alt="" srcset="" />
    </p>
    <p class="donate-img">如果觉得这个项目还不错，可以请我喝杯咖啡</p>
  </div>
</template>

<script setup lang="ts">
import img1 from '@renderer/assets/1.png'
import img2 from '@renderer/assets/2.png'
import donate from '@renderer/assets/donate.jpg'
</script>

<style>
.donate-img {
  text-align: center;
}
.donate-img img {
  margin: 10px;
}
</style>
