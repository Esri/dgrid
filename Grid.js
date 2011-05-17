define(["dojo/_base/html", "dojo/_base/declare", "dojo/listen", "./TextEdit", "./List", "cssx/cssx"], function(dojo, declare, listen, TextEdit, List, cssx){
	var create = dojo.create;
	
	return declare([List], {
		columns: [],
		createRowCells: function(tag, each){
			// summary:
			//		Generates the grid for each row (used by renderHeader and and renderRow)
			var tr, row = create("table", {
			});
			var contentBoxSizing;
			if(dojo.isIE < 8 || dojo.isQuirks){
				if(!dojo.isQuirks){
					contentBoxSizing = true;
					row.style.width = "auto"; // in IE7 this is needed to instead of 100% to make it not create a horizontal scroll bar
				}
				var tbody = create("tbody", null, row);
			}else{
				var tbody = row;
			}
			var subrows = this.columns;
			if(!(subrows[0] instanceof Array)){
				subrows = [subrows];
			}
			for(var si = 0, sl = subrows.length; si < sl; si++){
				subrow = subrows[si];
				if(sl == 1 && !dojo.isIE){
					// shortcut for modern browsers
					tr = tbody;
				}else{
					tr = create("tr", null, tbody);
				}
				for(var i = 0, l = subrow.length; i < l; i++){
					// iterate through the columns
					var column = subrow[i];
					var field = column.field;
					var cell = create(tag,{
						className: "dojoxGridxCell dojoxGridxCellPadding " + (column.className || (field ? "field-" + field : "")) + " column-" + i,
						colid: i
					});
					if(contentBoxSizing){
						var innerCell = create("div", {
							className: "dojoxGridxCellPadding"
						}, cell);
						dojo.removeClass(cell, "dojoxGridxCellPadding");
					}else{
						innerCell = cell;
					}
					var colspan = column.colspan;
					if(colspan){
						cell.setAttribute("colSpan", colspan);
					}
					var rowspan = column.rowspan;
					if(rowspan){
						cell.setAttribute("rowSpan", rowspan);
					}
					each(innerCell, column);
					// add the td to the tr at the end for better performance
					tr.appendChild(cell);
				}
			}
			return row;
		},
		renderRow: function(object, options){
			var tabIndex = this.tabIndex;
			var row = this.createRowCells("td", function(td, column){
				td.setAttribute("role", "gridcell");
				td.setAttribute("tabindex", tabIndex);				
				var data = object, field = column.field;
				// we support the field, get, and formatter properties like the DataGrid
				if(field){
					data = data[field];
				}
				if(column.get){
					data = column.get(data);
				}
				if(column.formatter){
					data = column.formatter(data);
					td.innerHTML = data;
				}else if(!column.renderCell && data != null){
					td.appendChild(document.createTextNode(data));
				}
				// A column can provide a renderCell method to do its own DOM manipulation, 
				// event handling, etc.
				if(column.renderCell){
					column.renderCell(data, td, options, object);
				}
			});
			return row;
		},
		renderHeader: function(){
			// summary:
			//		Setup the headers for the grid
			var grid = this;
			var row = this.createRowCells("th", function(th, column){
				th.setAttribute("role", "columnheader");
				column.grid = grid;
				var field = column.field = column.field;
				if(column.editable){
					column = TextEdit(column);
				}
				if(field){
					th.setAttribute("field", field);
				}
				// allow for custom header manipulation
				if(column.renderHeaderCell){
					column.renderHeaderCell(th);
				}else if(column.name || column.field){
					th.appendChild(document.createTextNode(column.name || column.field));
				}
				if(column.sortable){
					th.setAttribute("sortable", true);
				}
			});
			row.className = "dojoxGridxRow ui-widget-header";
			this.headerNode.appendChild(row);
/*			create("th",{
				className:"dojoxGridxRightCorner dojoxGridxCell"
			}, row.getElementsByTagName("tr")[0] || row);*/
			var lastSortedArrow;
			// if it columns are sortable, resort on clicks
			listen(row, ".dojoxGridxCell:click", function(event){
				if(this.getAttribute("sortable")){
					var field = this.getAttribute("field");
					// resort
					var descending = grid.sortOrder && grid.sortOrder[0].attribute == field && !grid.sortOrder[0].descending;
					if(lastSortedArrow){
						dojo.destroy(lastSortedArrow);
					}
					lastSortedArrow = create("div",{
						role: 'presentation',
						className: 'dojoxGridxArrowButtonNode'
					}, this);
					dojo.removeClass(this, "dojoxGridxSortUp");
					dojo.removeClass(this, "dojoxGridxSortDown");
					dojo.addClass(this, descending ? "dojoxGridxSortDown" : "dojoxGridxSortUp");					
					grid.sort(field, descending);
				}
			});
		},
		_styleSheets: {},
		styleColumn: function(colId, css){
			// summary:
			//		Changes the column width by creating a dynamic stylesheet
			
			// first delete the old stylesheet (so it doesn't override the new one)
			var previousStyleSheet = this._styleSheets[colId];
			if(previousStyleSheet){
				dojo.destroy(previousStyleSheet);
			}
			// now create a stylesheet to style the column
			this._styleSheets[colId] = cssx.createStyleNode(
			"#" + this.domNode.id + ' th.column-' + colId + ', #' + this.domNode.id + ' td.column-' + colId + '{' +
				 css +
			"}");
		}
	});/*
	if(!has("dom-fixedtablespans")){
		var space = {};
		var fixColumns = function(subrows){
			var fixed = [[]];
			// put everything in a spatial grid
			for(var y = 0; y < subrows.length;y++){
				var columns = subrows[y];
				var x = 0;
				for(var i = 0; i < columns.length;i++){
					while(fixed[y][x]){
						x++;
					}
					var cell = columns[i];
					for(var y2 = 0; y2 < (cell.row || 1); y2++){
						for(var x2 = 0; x2 < (cell.colspan || 1); x2++){
							fixed[y][x] = space;
						}
					}
					fixed[y][x] = columns[i];
					x = x2;
				}
			}
		
			for(var y = 0; y < fixed.length;y++){
				var fixedRow = fixed[y];
				var x = 0;
				for(var i = 0; i < fixedRow.length;i++){
					var fixedCell
				}
					while(fixed[y][x]){
					}
	}*/
});