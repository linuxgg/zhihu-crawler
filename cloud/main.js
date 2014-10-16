var moment = require('moment');
var async = require('async');

var Story = AV.Object.extend("Story");

function createStory(json, onSuccess, onError) {
	var story = new Story();
	console.log(json);
	story.save(json, {
	  success: function(story) {
	    onSuccess(story);
	  },
	  error: function(story, error) {
	    console.log(error);
	    onError(error.description);
	  }
	});
}

AV.Cloud.define("fetchZhihu", function(request, response) {
  AV.Cloud.httpRequest({
    url: 'http://news.at.zhihu.com/api/3/news/before/' + moment().format("YYYYMMDD"),
    headers: {
		'Content-Type': 'application/json'
	},
    success: function(httpResponse) {
    	var data = httpResponse.data;
		var date = data.date;
		async.each(data.stories, function(story, callback) {
			story.date = date;
			story._id = story.id;
			delete story['id']
	  		createStory(story, function(story) {
	  			callback(null, httpResponse.data);
	  		}, function(story, error) {
	  			callback(error);
	  		});
		}, function(err) {
			if (err) {
				response.error(err);
			} else {
				response.success('success');
			}
		});
    },
    error: function(httpResponse) {
		response.error(httpResponse.status);
    }
  });
});