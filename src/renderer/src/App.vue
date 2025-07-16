<script setup lang="ts">
const args = []
const ipcHandle = (): Promise<void> => window.electron.ipcRenderer.invoke('create-cert', ...args)
</script>

<template>
  <div class="action">
    <a target="_blank" rel="noreferrer" @click="ipcHandle">Send IPC</a>
  </div>
</template>
