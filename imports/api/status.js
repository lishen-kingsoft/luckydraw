import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

import { defaultStatus } from '/imports/api/statusDefaults';
 
export const Status = new Mongo.Collection('status');
Meteor.methods({
  'removeAllStatus' : function () {
    Status.remove({});
  },
  'resetAllStatus': function() {
    Status.remove({});
    Status.batchInsert(defaultStatus);
  }
});