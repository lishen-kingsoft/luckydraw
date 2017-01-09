import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { defaultPpl } from '/imports/api/pplDefaults';
 
export const Ppl = new Mongo.Collection('ppl');
Meteor.methods({
  'removeAllPpl' : function () {
    Ppl.remove({});
  },
  'resetAllPpl': function() {
    Ppl.remove({});
    Ppl.batchInsert(defaultPpl);
  }
});