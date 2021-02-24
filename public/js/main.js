var ready = (callback) => {
	if (document.readyState != 'loading') callback();
	else document.addEventListener('DOMContentLoaded', callback);
};

ready(() => {
	// After document is ready
	document.querySelector('.delete-article').addEventListener('click', (e) => {
		const target = e.target;
		var id = target.getAttribute('data-id');
		// AJAX
		const url = '/delete-article/' + id;

		fetch(url, { method: 'DELETE' })
			.then((data) => {
				window.location.href = '/';
			})
			.catch((error) => {
				console.log(error);
			});
	});
});
