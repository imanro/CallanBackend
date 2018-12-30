'use strict';



class ConfigService {

  constructor() {
    console.log('config constructor!');
    this.config = {};
    this.loadConfig();
  }

  loadConfig() {

    const path = '../conf/config.json';
    const localPath = '../conf/config.local.json';

    try {
      const source = require(path);
      this.readConfig(source);
    } catch (e) {
      console.error('Unable to read global conf:', e);
      ;
    }

    try {
      const source = require(localPath);
      this.readConfig(source);
    } catch (e) {
      console.error('Unable to read local conf:', e);
      ;
    }
  }

  readConfig(source) {
    for (const k in source) {
      if (source.hasOwnProperty(k)) {
        this.config[k] = source[k];
      }
    }
  }

  getValue(name) {
    const parts = name.split(/\./);

    let container = this.config;

    if (parts.length > 1) {
      for (let i = 0; i < parts.length - 1; i++) {
        container = this.config[parts[i]];
      }
    }

    const key = parts[parts.length - 1];

    return container[key];
  }
}

module.exports = ConfigService;