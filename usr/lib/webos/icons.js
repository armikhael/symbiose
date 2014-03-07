(function () {
	Webos.Icon = function (name, size, theme) {
		if (typeof name == 'undefined') {
			name = 'apps/default';
		}

		if (typeof Webos.Icon.sizes[size] != 'undefined') {
			size = Webos.Icon.sizes[size];
		}
		
		this.setName(name);
		this.setSize((typeof size == 'undefined' || isNaN(parseInt(size))) ? 48 : parseInt(size));
		this.setTheme(theme);

		if (!/^[\/(~\/)]/.test(this.name)) {
			Webos.Icon._cache[this.id()] = this;
		}
	};
	Webos.Icon.prototype = {
		id: function (size, theme) {
			if (/^[\/(~\/)]/.test(this.name)) {
				return undefined;
			}
			
			size = (typeof size == 'undefined') ? this.size : size;
			
			if (typeof Webos.Icon._cache[this.name] != 'undefined' && Webos.Icon._cache[this.name].size >= size) {
				return Webos.Icon._cache[this.name].id(size, theme);
			}
			
			if (this.type == 'themes') {
				var theme = (typeof theme == 'undefined') ? ((typeof this.theme == 'undefined') ? Webos.Theme.current().get('icons') : this.theme) : size;
				return this.type+'/'+theme+'/'+size+'/'+this.name;
			} else {
				return this.type+'/'+size+'/'+this.name;
			}
		},
		path: function (size, theme) {
			var id = this.id(size, theme);
			if (typeof id == 'undefined') {
				return this.name;
			} else {
				return Webos.Icon.path+'/'+id+'.png';
			}
		},
		realpath: function (size, theme) {
			var id = this.id(size, theme);

			var url = '';
			if (typeof id == 'undefined') {
				var iconFile = W.File.get(this.name);
				url = iconFile.get('realpath');
			} else {
				if (Webos.standalone) {
					if (Webos.Icon.supportsSvg()) {
						id = this.id('scalable', theme);
					}

					var ext = (Webos.Icon.supportsSvg()) ? 'svg' : 'png';

					iconPath = Webos.Icon.path+'/'+id+'.'+ext;

					var iconFile = W.File.get(iconPath);
					url = iconFile.get('realpath');
				} else {
					url = 'sbin/rawdatacall.php?type=icon&index='+id;

					if (Webos.Icon.supportsSvg()) {
						url += '&svg=1';
					}
				}
			}

			return url;
		},
		is: function (icon) {
			icon = Webos.Icon.toIcon(icon);
			
			if (this.type == icon.type && this.name == icon.name) {
				return true;
			}
			
			return false;
		},
		setName: function (name) {
			var nameArray = name.split('/');
			var type = Webos.Icon.types[0];
			if ($.inArray(nameArray[0], Webos.Icon.types) != -1) {
				type = nameArray[0];
				nameArray.shift();
				name = nameArray.join('/');
			}
			
			this.name = name;
			this.type = type;
		},
		setSize: function (size) {
			this.size = parseInt(size) || 48;
		},
		setTheme: function (theme) {
			this.theme = theme;
		},
		toString: function () {
			return this.realpath();
		}
	};

	Webos.Icon.types = ['themes', 'applications'];
	Webos.Icon.path = '/usr/share/icons';
	Webos.Icon.sizes = {
		button: 24
	};
	Webos.Icon._cache = {};
	Webos.Icon.toIcon = function(arg) {
		if (arg instanceof Webos.Icon) {
			return arg;
		}
		
		if (arg instanceof Array) {
			if (typeof arg[0] == 'string') {
				return new Webos.Icon(arg[0], arg[1], arg[2]);
			}
		}
		
		switch (typeof arg) {
			case 'object':
				if (arg.name) {
					return new Webos.Icon(arg.name, arg.size, arg.theme);
				}
			case 'string':
				return new Webos.Icon(arg);
			default:
				return new Webos.Icon();
		}
	};
	Webos.Icon.supportsSvg = function () {
		return (!! document.createElementNS &&
				!! document.createElementNS (
					'http://www.w3.org/2000/svg',
					"svg"
				).createSVGRect);
	};
})();