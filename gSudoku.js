/**=========================== Sudoku directive ==============================*/
var $gzg=angular.module("gSudoku",[]);
$gzg.run(function(){
	var myStyleDom='<style id="g-sudoku-cell-injected-style"> '
		+'.g-sudoku-row {position:static;display:block!important;'
		+'}'
		+'\r\n.g-sudoku-cell {position:absolute;vertical-align:middle;text-align:center;'
		+'display:box;box-align:center;box-pack:center;'
		+'display:-webkit-box;-webkit-box-align:center;-webkit-box-pack:center;'
		+'display:-moz-box!important;-moz-box-align:center;-moz-box-pack:center;'
		+'padding:2px;font-size:xx-large;background-position:center;background-repeat:no-repeat;'
		+'}'
		+'\r\n.g-sudoku-cell-hover {z-index:109;'
		+'box-shadow:4px 4px 8px #222;-moz-box-shadow:4px 4px 8px #222;-webkit-box-shadow:4px 4px 8px #222;'
		+'transition-duration: 500ms;-webkit-transition-duration: 500ms;'
		+'-moz-transition-duration:500ms;-ms-transition-duration: 500ms;'
		+'transform:scale(1.1,1) translate(0,-5px);-moz-transform:scale(1.1,1) translate(0,-5px);'
		+'-webkit-transform:scale(1.1,1) translate(0,-5px);-ms-transform:scale(1.1,1) translate(0,-5px);'
		+'}'
		+'</style>'	;

	var sdom=document.querySelector("#g-sudoku-cell-injected-style");
	if(!sdom){					
		var sel = angular.element(myStyleDom);
		var head = angular.element(document.head);
		console.log("not found g-sudoku-cell-injected-style,now to inject:",sel[0]);
		//console.log("now in ready ,to injecting");
		angular.element(document.head).append(sel);
	}
});
$gzg.directive("gSudoku",function($rootScope,$timeout){
	var rsf= function(theScope) {  
		var scope = theScope;
		el = scope.el;
		console.log("g-sudoku rsf called");
		if(scope.hr || scope.wr){
			var ah = document.documentElement.clientHeight || document.body.clientHeight ;
			var aw = document.documentElement.clientWidth || document.body.clientWidth ;
			var top = getElementAbsoluteTop(el);
			ah -= top;
			console.log("g-sudoku rsf top=",top," ah=",ah,"aw=",aw ," hrate=",scope.hr," wrate=",scope.wr);
			if(scope.hr){
				scope.totalHeight = ah * scope.hr;
				el.css("height",scope.height+"px");
				console.log("g-sudoku rsf calc height=",scope.totalHeight);
			}
			if(scope.wr){
				scope.totalWidth = aw * scope.wr;
				el.css("width",scope.width+"px");
				console.log("g-sudoku rsf calc width=",scope.totalWidth);
			}
			sz = getElementInnerSize(el);
			var ps = {width:sz.width,height:sz.height};
			//console.log("g-sudoku onResize ps=",ps);
			//console.log("g-sudoku scope.$parent===",scope.$parent);
			scope.ctrl.onResize(ps);
			//scope.$broadcast("G_EVT_SUDOKU_LAYOUT",ps);
		}		
    };
	var dv={
	restrict:"EA"
	,scope:{height:"@height",width:"@width",bgColor:"@bgcolor",foreColor:"@forecolor"
		,cellSpacing:"@cellspacing",rowSpacing:"@rowspacing",cursor:"@cursor"
	}
	,controller:function($scope){
		angular.extend(this,{
			rows:[],rowsHeight:[],cells:[],
			getWidth:function(){
				return $scope.totalWidth;
			},
			getHeight:function(){
				return $scope.totalHeight;
			},
			registerRow:function(rowEl,rowScope,fnOnResize){
				var rowObj={el:rowEl,fn:fnOnResize,rowIndex:this.rows.length,scope:rowScope};
				this.rows.push(rowObj);
				this.rowsHeight.push(rowEl[0].offsetHeight);
				return rowObj.rowIndex;
			},
			registerCells:function(rowIndex,cells){
				var self = this;
				angular.forEach(cells,function(cell,ind){
					cell.rowIndex=rowIndex;
					self.registerCell(cell);
				});
			},
			registerCell:function(cell){
				if(cell.el[0].parentElement!==$scope.el[0]){
					$scope.el[0].appendChild(cell.el[0]);		
					this.layoutCell(cell);
					this.cells.push(cell);			
				}
			},
			layoutCell:function(cell){
				var top = this.getRowTop(cell.rowIndex);
				var nTop = {"top":top+"px"};
				cell.el.css(nTop);
				console.log("g-sudoku layoutCell to set cell",cell.el[0].innerText,cell.rowIndex,cell.cellIndex,"  at top :",nTop);
			},
			onResize:function(){
				var rgap = this.getRowSpacing();
				var workHeight = this.getHeight() - rgap * (this.rows.length - 1);
				var ps = {width:this.getWidth(),height:workHeight};
				var top =0;
				var rowsHeight=this.rowsHeight;
				angular.forEach(this.rows,function(row,ind){
					var sizeRow = {"top" : top+"px"};
					//console.log("g-sudoku onResize to set row top:",sizeRow);
					row.el.css(sizeRow);
					var rh=row.fn(ps);
					rowsHeight[ind]=rh;
					top = top + rh + rgap;
				});
			},			
			getCellSpacing:function(){
				var s = $scope.cellSpacing;
				var n = angular.isString(s)?parseInt(s):s;
				n = isNaN(n)?0:n;
				//console.log("!!!!!!sudoku.getCellSpacing return=",n);
				return n;
			},
			getRowSpacing:function(){
				var s = $scope.rowSpacing;
				var n = angular.isString(s)?parseInt(s):s;
				n = isNaN(n)?0:n;
				return n;
			},
			getRowTop:function(rowIndex){
				var rgap = this.getRowSpacing();
				var h=0;
				for(var i=0;i< rowIndex;i++){
					h += this.rowsHeight[i];
				}
				h += rgap * i;
				return h;
			},
			getCursor:function(){
				return $scope.cursor || "pointer";
			},
			getDomEl:function(){
				return $scope.el[0];
			}
				
		});
		$scope.ctrl= this;
		//console.log("g-sudoku controller scope=",$scope);
	}/** end of controller of sudoku */
	,link:function(scope,element,attrs){
		//element.css({"position":"absolute","z-index":"103"});
		console.log("g-sudoku link ,cellSpacing=",scope.cellSpacing," bgColor=",scope.bgColor," scope=",scope);
		scope.scopeName = "g-sudoku-scope";
		scope.el=element;
		element.addClass("g-sudoku");
		var sv = attrs["bgcolor"];
		if(sv)element.css("background-color",sv);
		sv = attrs["forecolor"];
		if(sv)element.css("color",sv);
		sv = attrs["cursor"];
		scope.cursor=sv;
		var h=scope.height;
		h = getNumAttr(h);
		scope.totalHeight=h;
		if(h<=1)scope.hr=h;
		
		var w=scope.width;
		w = getNumAttr(w);
		scope.totalWidth=w;
		if(w<=1)scope.wr=w;
		
		angular.element(window).on("resize",function(){rsf(scope);});
		$timeout(function(){rsf(scope);},50);
	 }
	};
	return dv;
});
/**=========================== Sudoku row directive ==============================*/
$gzg.directive("gSudokuRow",function($rootScope){
	var row_rsf=function(scope,newSize){
		if(!scope || !scope.el)return;
		var el = scope.el;
		console.log("g-sudoku-row rsf called with newSize=",newSize);
		if(scope.hr){
			var gap = getElementExtraHeight(el);
			console.log("g-sudoku-row hr=",scope.hr,"parent height=",newSize.height," extraHeight=",gap);
			if(scope.hr*newSize.height != scope.height){
				scope.height = scope.hr * newSize.height;// -gap/* no need to subtract this*/;
				el.css("height",scope.height+"px" );
				console.log("g-sudoku-row calc height=",scope.height);
			}
		}
		//for(pp in el){console.log(pp);}
		var ew =  getElementExtraWidth(el[0]);
		var ow = el[0].offsetWidth;
		var nw = newSize.width - ew;
		console.log("g-sudoku-row rsf offsetWidth , extraWidth ,destCssWidth =",ow,ew,nw);
		var w=ow;
		if(w != newSize.width){
			el.css("width",nw+"px");		
		}
		var sz = getElementInnerSize(el);
		var nw = sz.width - scope.cellSpacing * (scope.ctrl.cells.length -1);
		
		var ps = {width:nw,height:sz.height};
		console.log("g-sudoku-row sizeChanged ,calling cell's onResize with ps=",ps);
		//scope.$broadcast("G_EVT_SUDOKU_CELL_LAYOUT",ps);
		scope.ctrl.onResize(ps);
		return scope.height;
	
	};
	var dv={
	restrict:"EA"
	,require:"^gSudoku"
	,scope:{}/** sudoku row has inherit local scope*/	
	,controller:function($scope){		
		angular.extend(this,{
			cellIndex:-1,
			cells:[],cellRegistered:false,
			registerCell:function(cellEl,cellScope,fnOnResize){
				this.cellIndex++;
				var cell = {el:cellEl,scope:cellScope,fn:fnOnResize,cellIndex:this.cellIndex,rowSpan:cellScope.rowSpan};
				this.cells.push(cell);							
			},
			onResize:function(ps){
				if(!this.cellRegistered){
					this.cellRegistered=true;
					$scope.parentCtrl.registerCells($scope.rowIndex,this.cells);
				}
				var d= $scope.el[0];
				var pl=d.style.paddingLeft?parseInt(d.style.paddingLeft):0;
				var right=-1 + pl;
				console.log("g-sudoku-row resizing cell with cellSpacing=",$scope.cellSpacing);
				angular.forEach(this.cells,function(cell,ind){
					/*if(cell.el[0].parentElement===$scope.el[0]){
						var ctl = $scope.parentCtrl;
						ctl.getDomEL().appendChild(cell.el[0]);		
						var top = ctl.getRowTop($scope.rowIndex);
						var nTop = {"top":top+"px"};
						cell.el.css(nTop);						
					}*/
					$scope.parentCtrl.layoutCell(cell);
					ps.left = right+1;
					console.log("g-sudoku-row calling cell resizeFn with ps=",ps," spacing=",$scope.cellSpacing);
					var w=cell.fn(cell.scope,ps);
					right += (w + $scope.cellSpacing);
				});
			},
			getCursor:function(){
				return $scope.cursor;
			},
			getParentCtrl:function(){
				return $scope.parentCtrl;
			}
		});
		$scope.ctrl = this;
	 }
	,link:function(scope,el,attrs,pCtrl){
		scope.scopeName = "g-sudoku-row-scope";
		scope.el = el; scope.parentCtrl = pCtrl;
		console.log("g-sudoku-row link.");
		el.addClass("g-sudoku-row");
		var h=attrs["height"];
		h = getNumAttr(h);
		scope.height=h;
		if(h<=1)scope.hr=h;else {scope.hr=false;}
		scope.bgColor = attrs["bgcolor"];
		scope.padding = attrs["padding"];
		if(scope.bgColor)el.css({"background-color":scope.bgColor});
		if(scope.padding){
			if(scope.padding.indexOf("px")<0)scope.padding+="px";
			el.css("padding",scope.padding);
		}	
		scope.cursor = pCtrl.getCursor();
		scope.cellSpacing = pCtrl.getCellSpacing();
		console.log("in sudoku-row pCtrl.getCellSpacing=",pCtrl.getCellSpacing());
		if(pCtrl && pCtrl.registerRow) scope.rowIndex=pCtrl.registerRow(el,scope,function(ps){
			return row_rsf(scope,ps);
		});
	 }
	};
	return dv;
});
/**===================== Sudoku cell directive ========================*/
$gzg.directive("gSudokuCell",function($compile,$rootScope,$timeout,$location,$window){
	var cell_rsf = function(theScope,ps){
		var scope = theScope;
		if(!scope || !scope.el)return;
		var el= scope.el;
		var dom=el[0];
		if(!dom.style.cursor){
			cursor = scope.target ? (scope.cursor || scope.rowCtrl.getCursor()) : "default";
			console.log("g-sudoku-cell to cursor=",cursor);
			el.css("cursor",cursor);
		}
		console.log("g-sudoku-cell-",scope.title," rsf called ,wr=",scope.wr," with ps=",ps);
		var h = dom.offsetHeight,w = dom.offsetWidth;
		var ew = getElementExtraWidth(dom);
		var nw=w;
		if(scope.wr){
			nw = scope.wr * ps.width;
			if(nw!=w) {
				nw = nw - ew;
				el.css("width",nw+"px");
			}
		}
		if(ps.height!=h)el.css("height",ps.height+"px");
		el.css("left",ps.left+"px");
		//el.css("top",el[0].parentElement.offsetTop+getFinalStyle(el,"paddingTop")+"px");
		console.log("g-sudoku-cell calced,left=",ps.left," width=",nw," height=",ps.height);
		dis = getFinalStyle(el,"display");
		if(dis.indexOf("box")<0){
			console.log("g-sudoku-cell-",scope.title||''," display not box");
			var d = el[0].querySelector("div");
			if(d){
				console.log("******* now to adjust inner div by program **********");			
				position = getFinalStyle(d,"position");
				if(position!="absolute"){
					d.style.position="absolute";
					console.log("change inner div's position to absolute");
				}
				rt = getElementPos(d);
				console.log("inner div pos=",rt);
				l = Math.round(nw/2 - rt.width/2); r=Math.round(ps.height/2 - rt.height/2);
				console.log(" to move it to ",l,r);
				
				d.style.left = l.toString()+"px";
				d.style.top = r.toString()+"px";				
			
			}
		}else{
			console.log("******* good! box style worked ******");
		}
		//console.log("g-sudoku-cell.scope scope.$parent scope.$parent.$parent",scope,scope.$parent,scope.$parent.$parent);
		return nw;
	};
	var dv={	
	restrict:"EA"
	,require:"^gSudokuRow"
	,template:'<div class="g-sudoku-cell">'
	+'<div disabled="disabled">{{title}}</div></div>'
	,scope:{}	
	,replace:true
	,link:function(scope,el,attrs,rowCtrl){
		scope.el = el;
		scope.scopeName = "g-sudoku-cell-scope";
		scope.rowCtrl = rowCtrl;
		console.log("g-sudoku-cell link ");		
		
		
		scope.image = attrs["image"]||"";
		scope.bgColor = attrs["bgcolor"] ||"transparent";
		scope.foreColor = attrs["forecolor"] ||"black";
		scope.title = attrs["title"] || "";		
		scope.target = attrs["target"];
		scope.cursor = attrs["cursor"];
		scope.rowSpan = attrs["rowspan"] ? parseInt(attrs["rowspan"]):1;
		w = getNumAttr(attrs["width"]);
		scope.width=w;
		if(w<=1)scope.wr=w;else scope.wr=false;
		//console.log("image=",scope.image," bgcolor=",scope.bgcolor," forecolor=",scope.forecolor
		//	," title=",scope.title," width=",scope.width);
		el.css({"background-color":scope.bgColor
			,"background-image":"url('"+scope.image+"')"	
			,"color":scope.foreColor	
	
		});
		el.on("mouseenter",function(){el.addClass("g-sudoku-cell-hover");});
		el.on("mouseout",function(E){
			var innerDiv=  el[0].querySelector("div");
			if(E.explicitOriginalTarget && isDescendantElOf(E.explicitOriginalTarget,el[0]))return;
			if((E.fromElement && innerDiv=== E.fromElement) ||(E.target && innerDiv=== E.target) 
				||(E.toElement && innerDiv ===E.toElement) ||(E.srcElement && innerDiv ===E.srcElement)	)return;
			el.removeClass("g-sudoku-cell-hover");
		});
		if(rowCtrl && rowCtrl.registerCell)rowCtrl.registerCell(el,scope,cell_rsf);
		el.on("click tap",function(E){
			if(el.data("clickable")!=undefined && !el.data("clickable"))return;
			el.data("clickable",false);
			ctl=scope.rowCtrl.getParentCtrl();
			tw=ctl.getWidth();th=ctl.getHeight();
			sz=getElementAbsolutePos(el);
			sx=tw/sz.width;sy=th/sz.height;
			tx=(sz.left - (tw/2 -sz.width/2))*-1;ty=(sz.top - (th/2 - sz.height/2))*-1;
			var pstyle='<style id="g-sudoku-pop-style-injected">\r\n'
				+'.g-sudoku-cell-tapped {z-index:110;transform-origion:(center,center);'
				+'transition-duration: 1500ms;-webkit-transition-duration: 1500ms;'
				+'-moz-transition-duration:1500ms;-ms-transition-duration: 1500ms;'
				+'transform:scale({0},{1}) ; -moz-transform:scale({0},{1}) ;'
				+'-webkit-transform:scale({0},{1}) ;-ms-transform:scale({0},{1});'
				+'}</style>'
			var notProperBehaivorTranslate="translate({2}px,{3}px)";
			var html = formatString(pstyle,sx,sy,tx,ty);
			console.log("active style generateed",html);
			nel=angular.element(html);
			oel=angular.element(document.querySelector('#g-sudoku-pop-style-injected'));
			if(oel)oel.remove();
			angular.element(document.head).append(nel);
			el.removeClass("g-sudoku-cell-hover");
			var oldcssLeft=el.css("left");
			var oldcssTop=el.css("top");
			var newPos ={"left":(tw/2-sz.width/2)+"px","top":(th/2-sz.height/2)+"px"}; 
			console.log("g-sudoku-cell new pos=",newPos);
			el.css(newPos);
			if(scope.target){
				var rg=/(^\w+\:\/\/){0,1}(\w+\.\w+)+/gi;
				if(rg.test(scope.target)){
					$window.location.href=scope.target;
					console.log("g-sudoku-cell on tap ,target is abolute url! now jump to ",scope.target);
					angular.element(document).on("unload",function(){
						el.removeClass("g-sudoku-cell-tapped");
						el.css({"left":oldcssLeft,"top":oldcssTop});
					});
				}else{
					$location.path(scope.target);
					console.log("g-sudoku-cell on tap ,change location to ",scope.target);
					$timeout(function(){el.removeClass("g-sudoku-cell-tapped");
						el.css({"left":oldcssLeft,"top":oldcssTop});
						el.data("clickable",true);
					},5000);
				}
			}
			el.addClass("g-sudoku-cell-tapped");
			
			
		});
	 }
	};
	return dv;
});

/**=========================== global utils ==============================*/
function formatString(s,args) { 
	if (arguments.length>0) { 
		var result = s; 
		if (arguments.length == 2 && typeof (args) == "object") { 
			for (var key in args) { 
				var reg=new RegExp ("({"+key+"})","g"); 
				result = result.replace(reg, args[key]); 
			} 
		}else { 
			for (var i = 1; i < arguments.length; i++) { 
				if(arguments[i]==undefined) { 
					return ""; 
				} else 	{ 
					var reg=new RegExp("({["+(i-1)+"]})","g"); 
					result = result.replace(reg, arguments[i]); 
				} 
			} 
		} 
		return result; 
	} else { 
		return s; 
	} 
}
function getNumAttr(sv){
	if(angular.isNumber(sv))return sv;
	var n=0;
 	if(angular.isString(sv)){
		if(sv.replace(" ","").match(/\d+%/))n=parseFloat(sv)/100;else n=parseFloat(sv);
		return n;
	}
}
function getElementPos(domel){
	var d = toDomElement(domel);
	return {left:d.offsetLeft,top:d.offsetTop,width:d.offsetWidth,height:d.offsetHeight};
}
function getElementAbsolutePos(domel){
	var d = toDomElement(domel);
	return {left:getElementAbsoluteLeft(d),top:getElementAbsoluteTop(d)
			,width:d.offsetWidth,height:d.offsetHeight};
}
function getElementInnerSize(domel){
	var d = toDomElement(domel);
	var	h = d.offsetHeight,w = d.offsetWidth;
	if(d.style && d.style.padding){
		h -= (parseInt(d.style.paddingTop)  + parseInt(d.style.paddingBottom));
		w -= (parseInt(d.style.paddingLeft) + parseInt(d.style.paddingRight));
	}
	return {width:w,height:h};
}

function getElementAbsoluteTop(domel){
	var d = toDomElement(domel);
	var t= d.offsetTop;
	//console.log("$$$$ getElementAbsoluteTop,t=",t,d,d.offsetTop);
	var pel = d.parentElement;
	//console.log("$$$$ d.parentElement=",d.parentElement,"pel=",pel);
	while(pel!=undefined){		
		t += pel.offsetTop;
		//console.log("$$$ parent el tag=",pel.tagName," parent el offsetTop=",pel.offsetTop,"t=",t);	
		pel = pel.parentElement;
	}	
	return t;
}
function getElementAbsoluteLeft(domel){
	var d = toDomElement(domel);
	var t= d.offsetLeft;
	var pel = d.parentElement;
	while(pel!=undefined){
		t += pel.offsetTop;
		//console.log("element ",pel," absolute top=",t);	
		pel = pel.parentElement;
	}
	return t;
}
/**
 * get element final calculated style value
 * return the value of attrName if given or the entire style
 */
function getFinalStyle(domel,attrName){
	var d = toDomElement(domel);
	var style=null;
	if(window.getComputedStyle){
		style=getComputedStyle(d,null);
	}else
		style = d.style;
	return 	attrName?style[attrName]:style;
}
function getElementExtraHeight(domel){
	var el = toDomElement(domel);
	fs=getFinalStyle(el);
	padding=parseInt(fs.paddingTop || fs.padding)+parseInt(fs.paddingBottom || fs.padding);
	margin=parseInt(fs.marginTop || fs.margin)+parseInt(fs.marginBottom ||fs.margin);
	border=parseInt(fs.borderTopWidth || fs.boderWidth) + parseInt(fs.borderBottomWidth || fs.borderWidth);
	gap = padding +margin + border;
	return gap;
}
function getElementExtraWidth(domel){
	var el = toDomElement(domel);
	fs=getFinalStyle(el);
	padding=parseInt(fs.paddingLeft || fs.padding)+parseInt(fs.paddingRight ||fs.padding);
	margin=parseInt(fs.marginLeft || fs.margin)+parseInt(fs.marginRight || fs.margin);
	border=parseInt(fs.borderTopWidth || fs.boderWidth) + parseInt(fs.borderBottomWidth || fs.borderWidth);
	gap = padding +margin + border;
	return gap;
}
function isDescendantElOf(descendantEl,el){
	var pel=toDomElement(descendantEl);
	var theEl=toDomElement(el);
	while(pel && pel.parentElement){
		pel = pel.parentElement;
		if(pel === theEl)return true;
	}
	return false;
}
function toDomElement(domel){
	var dom = domel;
	if(angular.isString(dom))dom = document.querySelector(dom);
	var dom=dom[0] || dom;
	return dom;
}

