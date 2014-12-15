var PageList = function() {

	PageList.prototype.init = function() {
		$(document).ready(function(){
			url = '/paginas.json';
			$('.datatable').dataTable({
				"autoWidth": false,
        		"paginationType": "full_numbers",
		        "processing": true,
		        "serverSide": true,
		        "deferRender": true,
        		"ajax": url,
        		"columns": [
		            { "data": "title","name": "title" },
		            { "data": "created","name": "created"}
		        ],
		        "order": [[ 1, "desc" ]]
			});
		});
	}
}

var pageList = new PageList()
pageList.init();0