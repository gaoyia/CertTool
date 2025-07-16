<template>
  <div class="home">
    <h1 @click="getTrustedRootCertificates">首页</h1>
    <p>欢迎使用证书工具</p>
  </div>
</template>
<script lang="ts" setup>
import { getTrustedRootCertificates } from '@renderer/api/certificate'
</script>
