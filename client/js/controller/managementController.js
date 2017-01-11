'use strict';

// @ngInject
import { Meteor } from 'meteor/meteor';

import { Configs } from '/imports/api/configs';
import { Status } from '/imports/api/status';
import { Ppl } from '/imports/api/ppl';

export default function($scope, $meteor, $reactive, $timeout) {
  'ngInject';
  
  $reactive(this).attach($scope);

  var vm = this;

  vm.tab = 'config';

  vm.helpers({
    dbConfigs() {
      return Configs.find({}, {sort: [['classSeq', 'asc'],['roundSeq', 'asc']]}, {reactive: false});
    },
    dbStatus() {
      return Status.find({}, {}, {reactive: false});
    },
    dbSelectedPpl() {
      return Ppl.find({$or: [{laId: {$ne: ''}},{gaId: {$ne: ''}}]}, {}, {reactive: false});
    }
  });

  vm.addedConfig = {};

  vm.resetAddedConfig = function() {
    vm.addedConfig = {
        class: '',
        classSeq: 0,
        round: '',
        roundSeq: 0,
        ppl: 0,
        scope: '',
        finished: false
    }
  };

  vm.resetConfig = function() {
    Meteor.call('resetAllConfig');
    Meteor.call('resetAllStatus');
    Meteor.call('resetAllPpl');
  };

  vm.deleteConfig = function(config) {
    Configs.remove(config._id);
  };

  vm.addConfig = function() {
    if(!vm.addedConfig.class) {
      alert('请输入正确奖品级别！');
      return;
    }
    if(!vm.addedConfig.classSeq) {
      alert('请输入正确级别序列！');
      return;
    }
    if(!vm.addedConfig.round) {
      alert('请输入正确奖品轮数！');
      return;
    }
    if(!vm.addedConfig.roundSeq) {
      alert('请输入正确轮数序列！');
      return;
    }
    if(!vm.addedConfig.ppl) {
      alert('请输入正确中奖人数！');
      return;
    }
    if(!vm.addedConfig.scope || (vm.addedConfig.scope != '小西山居' && vm.addedConfig.scope != '大西山居')) {
      alert('请输入正确中奖范围！');
      return;
    }
    Configs.insert(vm.addedConfig);
  };

  vm.stop = function() {
    $timeout(function() {
      $('#bgm')[0].pause();
      $('#donem')[0].play();
    }, 300);
    var pageId = vm.dbStatus[0]._id;
    Configs.update({_id: vm.nextDraw._id},  {$set:{finished: true}});
    Status.update({_id: pageId}, {$set:{page: 'result'}});
  }

  vm.start = function() {
    if (!vm.nextDraw) {
      alert('已完成抽奖');
      return;
    }
    var lastFinished = _.find(angular.copy(vm.dbConfigs).reverse(), (config) => {
        return config.finished == true;
    });
    var pageId = vm.dbStatus[0]._id;
    var pageStatus = vm.dbStatus[0].page;
    if (pageStatus == 'ready') {
      Status.update({_id: pageId}, {$set:{page: 'running'}});
      $timeout(function() {
        $('#bgm')[0].play();
      }, 10);
    } else if (pageStatus == 'result') {
      if(lastFinished && vm.nextDraw.classSeq == lastFinished.classSeq) {
        Status.update({_id: pageId}, {$set:{page: 'running'}});
        $timeout(function() {
          $('#bgm')[0].play();
        }, 10);
      } else {
        Status.update({_id: pageId}, {$set:{page: 'ready'}});
      }
    }
  };

  vm.enhanceDbConfigs = function() {
    vm.enhancedConfigs = angular.copy(vm.dbConfigs);
    var groupedConfigs = _.values(_.groupBy(vm.enhancedConfigs, 'classSeq'));
    _.each(groupedConfigs, function(configs) {
      _.each(configs, function(config, index, group){
        config.classLength = group.length;
        if(index == 0) {
          config.firstOfClass = true;
        }
      });
    });
    
    var nextDraw = _.find(vm.enhancedConfigs, (config) => {
      return !config.finished;
    });
    vm.nextDraw = nextDraw;
    if(vm.nextDraw) {
      vm.nextDraw.nextDraw = true
    }
  };

  vm.getClasses = function() {
    return _.keys(_.groupBy(vm.enhancedConfigs, 'class'));
  };

  vm.selectClass = function(classStr) {
    vm.selectedClass = classStr;
  };

  vm.getRounds = function() {
    return _.keys(_.groupBy(_.filter(vm.enhancedConfigs, (config) => {
      return config.class == vm.selectedClass;
    }), 'round'));
  };

  vm.getPpls = function(round) {
    var config = _.find(vm.enhancedConfigs, (config) => {
      return config.class == vm.selectedClass && config.round == round;
    });
    if (config) {
      var configId = config._id;
      return _.filter(vm.dbSelectedPpl, (ppl) => {
        return ppl.laId == configId || ppl.gaId == configId;
      });
    }
  };

  vm.updateDone = function(ppl) {
    Ppl.update({_id: ppl._id},  {$set:{done: ppl.done}});
  };

  vm.init = function() {
    vm.resetAddedConfig();
    $scope.$watch('vm.dbConfigs', function() {
      vm.enhanceDbConfigs();
    }, true);
  };

  vm.init();
}