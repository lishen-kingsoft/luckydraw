import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { defaultConfig } from '/imports/api/configsDefaults';
 
export const Configs = new Mongo.Collection('configs');
Meteor.methods({
  'removeAllConfig' : function () {
    Configs.remove({});
  },
  'resetAllConfig': function() {
    Configs.remove({});
    Configs.batchInsert(defaultConfig);
  }
});