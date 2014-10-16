var moment = require('moment');

var LatestNews = AV.Object.extend("LatestNews");

function createStories(latestNews, onSuccess, onError) {
	var object = new LatestNews();
	object.save(latestNews, {
		success: function(news) {
			onSuccess(news);
		},
		error: function(item, error) {
			onError(error);
		}
	});
}

AV.Cloud.define('fetchZhihu', function(request, response) {
	var dateStr = moment().format('YYYYMMDD');
	var query = new AV.Query(LatestNews);
	query.equalTo("date", dateStr);
	query.first({
		success: function(latestNews) {
			if (latestNews == null) {
				doFetch(response);
			} else {
				doFetch(response, latestNews);
			}
		},
		error: function(error) {
			console.error(error);
			doFetch(response);
		}
	});
});

function doFetch(response, latestNews) {
	console.log('fetch date: ' + moment().format('YYYYMMDD'));
	AV.Cloud.httpRequest({
		url: 'http://news-at.zhihu.com/api/3/news/latest',
		headers: {
			'Content-Type': 'application/json'
		},
		success: function(httpResponse) {
			if (latestNews) {
				latestNews.set('stories', httpResponse.data.stories);
				latestNews.set('top_stories', httpResponse.data.top_stories);
				latestNews.save(function() {
					response.success('success');
				}, function(error) {
					response.error(error);
				});
			} else {
				createStories(httpResponse.data, function() {
					response.success('success');
				}, function(error) {
					response.error(error);
				});
			}
		},
		error: function(httpResponse) {
			response.error(httpResponse.status);
		}
	});
}