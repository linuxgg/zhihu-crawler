var moment = require('moment');

var LatestNews = AV.Object.extend("LatestNews");

function createStories(latestNews, onSuccess, onError) {
	new LatestNews().save(latestNews, {
		success: onSuccess,
		error: onError
	});
}

AV.Cloud.define('fetchZhihu', function(request, response) {
	var dateStr = moment().format('YYYYMMDD');
	var query = new AV.Query(LatestNews);
	query.equalTo("date", dateStr);
	query.find({
		success: function(results) {
			if (results.length == 0) {
				doFetch(response);
			}
		},
		error: function(error) {
			console.error(error);
			doFetch(response);
		}
	});
});

function doFetch(response) {
	console.log('fetch date: ' + moment().format('YYYYMMDD'));
	AV.Cloud.httpRequest({
		url: 'http://news-at.zhihu.com/api/3/news/latest',
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(httpResponse) {
			createStories(httpResponse.data, function(list) {
				response.success('success');
			}, function(error) {
				response.error(error);
			});
		},
		error: function(httpResponse) {
			response.error(httpResponse.status);
		}
	});
}