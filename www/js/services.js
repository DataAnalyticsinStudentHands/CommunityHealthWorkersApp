'use strict';

var vmaServices = angular.module('vmaServicesModule', ['restangular']);

vmaServices.factory('vmaGroupService', ['Restangular', '$q', '$filter', function(Restangular, $q, $filter) {
    var allGroups = [];
    var manGroups = [];
    var memGroups = [];
    return {
        updateGroups:
            //ACCESSES SERVER AND UPDATES THE LIST OF GROUPS
            function() {
                var gProm = Restangular.all("groups").one("byMembership").getList();
                gProm.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    memGroups = success;
                }, function(fail) {
        //            console.log(fail);
                });
                var gPromByMan = Restangular.all("groups").one("byManager").getList();
                gPromByMan.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    manGroups = success;
                }, function(fail) {
        //            console.log(fail);
                });
                var gPromMaster = Restangular.all("groups").getList();
                gPromMaster.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    allGroups = success;
                }, function(fail) {
        //            console.log(fail);
                });
                return $q.all([gProm, gPromByMan, gPromMaster]);
            },
        getAllGroups: 
            function() {
                return this.updateGroups().then(function(success) { return allGroups; });
            },
        getManGroups: 
            function() {
                return this.updateGroups().then(function(success) { return manGroups; });
            },
        getMemGroups:
            function() {
                return this.updateGroups().then(function(success) { return memGroups; });
            },
        getGroup:
            function(group_id) {
                return $filter('getById')(allGroups, group_id);
            },
        addGroup:
            function(group) {
                return Restangular.all("groups").post(group);
            },
        editGroup:
            function(id, group) {
                 return Restangular.all("groups").all(id).post(group);
            },
        deleteGroup:
            function(gid) {
                return Restangular.all("groups").all(gid).remove();
            },
        joinGroup:
            function(gid, uid) {
                return Restangular.all("groups").all(gid).all("MEMBER").all(uid).post();
            },
        leaveGroupManager:
            function(gid, uid) {
                 return Restangular.all("groups").all(gid).all("MANAGER").all(uid).remove().then(function(success) {});
            },
        leaveGroupMember:
            function(gid, uid) {
                return this.leaveGroupManager(gid, uid).then(function(success) {
                    return Restangular.all("groups").all(gid).all("MEMBER").all(uid).remove().then(function(success) {});
                });
            }
    }
}]);

vmaServices.factory('vmaTaskService', ['Restangular', '$q', '$filter', function(Restangular, $q, $filter) {
    var allTasks = [];
    var manTasks = [];
    var memTasks = [];
    return {
        updateTasks:
            //ACCESSES SERVER AND UPDATES THE LIST OF TASKS
            function() {
                var gProm = Restangular.all("tasks").one("byMembership").getList();
                gProm.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    memTasks = success;
                }, function(fail) {
        //            console.log(fail);
                });
                var gPromByMan = Restangular.all("tasks").one("byManager").getList();
                gPromByMan.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    manTasks = success;
                }, function(fail) {
        //            console.log(fail);
                });
                var gPromMaster = Restangular.all("tasks").getList();
                gPromMaster.then(function(success) {
                    success = Restangular.stripRestangular(success);
                    allTasks = success;
                }, function(fail) {
        //            console.log(fail);
                });
                return $q.all([gProm, gPromByMan, gPromMaster]);
            },
        getAllTasks: 
            function() {
                return this.updateTasks().then(function(success) { return allTasks; });
            },
        getManTasks: 
            function() {
                return this.updateTasks().then(function(success) { return manTasks; });
            },
        getMemTasks:
            function() {
                return this.updateTasks().then(function(success) { return memTasks; });
            },
        getSubtractedTasks:
            function() {
                return this.updateTasks().then(function(success) {
                    var assignedGroupsIds = {};
                    var groupsIds = {};
                    var result = [];

                    var assignedGroups = manTasks.concat(memTasks);
                    var groups = allTasks;

                    assignedGroups.forEach(function (el, i) {
                        assignedGroupsIds[el.id] = assignedGroups[i];
                    });

                    groups.forEach(function (el, i) {
                        groupsIds[el.id] = groups[i];
                    });

                    for (var i in groupsIds) {
                        if (!assignedGroupsIds.hasOwnProperty(i)) {
                            result.push(groupsIds[i]);
                        }
                    }

                    return result;
                });
            },
        getAllTasksGroup: 
            function(gid) {
                return this.updateTasks().then(function(success) { return $filter('getTasksByGroupId')(allTasks, gid);});
            },
        getManTasksGroup: 
            function(gid) {
                return this.updateTasks().then(function(success) { return $filter('getTasksByGroupId')(manTasks, gid);});
            },
        getMemTasksGroup:
            function(gid) {
                return this.updateTasks().then(function(success) { return $filter('getTasksByGroupId')(memTasks, gid);});
            },
        getSubtractedTasksGroup:
            function(gid) {
                return this.updateTasks().then(function(success) {
                    var assignedGroupsIds = {};
                    var groupsIds = {};
                    var result = [];

                    var assignedGroups = manTasks.concat(memTasks);
                    var groups = allTasks;

                    assignedGroups.forEach(function (el, i) {
                        assignedGroupsIds[el.id] = assignedGroups[i];
                    });

                    groups.forEach(function (el, i) {
                        groupsIds[el.id] = groups[i];
                    });

                    for (var i in groupsIds) {
                        if (!assignedGroupsIds.hasOwnProperty(i)) {
                            result.push(groupsIds[i]);
                        }
                    }
                    var result = $filter('getTasksByGroupId')(result, gid);
                    return result;
                });
            },
        getJoinTasks:
            function() {
                return this.updateTasks().then(function(success) { return memTasks.concat(manTasks); });
            },
        getCalTasks:
            function() {
                return this.getJoinTasks().then(function(success) {
                    console.log(success);
                    var result = [];
                    success.forEach(function(entry) {
//                        console.log(new Date(entry.time));
                        var localoffset = (new Date(entry.time)).getTimezoneOffset();
                        // "unadjust" date
                        entry.time = new Date(entry.time.valueOf()/* - (localoffset * 60 * 1000)*/);
//                        console.log(new Date(entry.time));
//                        console.log(entry.id);
                        result.push({"title" : entry.name, "start": entry.time, "url": "viewTask(" + entry.id + ")"});
                    });
                    return result;
                });
            },
        getTask:
            function(task_id) {
                return $filter('getById')(allTasks, task_id);
            },
        getTaskView:
            function(task_id) {
                var viewTask = $filter('getById')(allTasks, task_id);
                if(viewTask.time) {
                    viewTask.time = new Date(viewTask.time).toDateString() + " " + new Date(viewTask.time).getHours() + ":" + new Date(viewTask.time).getMinutes();
                } else {
                    viewTask.time = "No Time Specified";
                }
                if(!viewTask.location) {
                    viewTask.show_map = false;
                } else {
                    viewTask.show_map = true;
                }
                console.log(viewTask);
                return viewTask;
            },
        addTask:
            function(task) {
                return Restangular.all("tasks").post(task);
            },
        editTask:
            function(id, task) {
                 return Restangular.all("tasks").all(id).post(task);
            },
        deleteTask:
            function(tid) {
                return Restangular.all("tasks").all(tid).remove();
            },
        joinTask:
            function(tid, uid) {
                return Restangular.all("tasks").all(tid).all("MEMBER").all(uid).post();
            },
        leaveTaskManager:
            function(tid, uid) {
                 return Restangular.all("tasks").all(tid).all("MANAGER").all(uid).remove().then(function(success) {});
            },
        leaveTaskMember:
            function(tid, uid) {
                return this.leaveTaskManager(tid, uid).then(function(success) {
                    return Restangular.all("tasks").all(tid).all("MEMBER").all(uid).remove().then(function(success) {});
                });
            }
    }
}]);