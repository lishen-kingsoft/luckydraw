import { Meteor } from 'meteor/meteor';
import { Configs } from '/imports/api/configs';
import { Status } from '/imports/api/status';
import { Ppl } from '/imports/api/ppl';

Meteor.startup(() => {
  if (Status.find().count() == 0) {
    Meteor.call('resetAllStatus');
  }

  if (Configs.find().count() === 0) { 
    Meteor.call('resetAllConfig');
  }

  if (Ppl.find().count() === 0) {
    Meteor.call('resetAllPpl');
  }
});