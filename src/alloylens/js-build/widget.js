var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/regl/dist/regl.js
var require_regl = __commonJS({
  "node_modules/regl/dist/regl.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? module.exports = factory() : typeof define === "function" && define.amd ? define(factory) : global.createREGL = factory();
    })(exports, function() {
      "use strict";
      var isTypedArray = function(x2) {
        return x2 instanceof Uint8Array || x2 instanceof Uint16Array || x2 instanceof Uint32Array || x2 instanceof Int8Array || x2 instanceof Int16Array || x2 instanceof Int32Array || x2 instanceof Float32Array || x2 instanceof Float64Array || x2 instanceof Uint8ClampedArray;
      };
      var extend2 = function(base, opts) {
        var keys = Object.keys(opts);
        for (var i = 0; i < keys.length; ++i) {
          base[keys[i]] = opts[keys[i]];
        }
        return base;
      };
      var endl = "\n";
      function decodeB64(str) {
        if (typeof atob !== "undefined") {
          return atob(str);
        }
        return "base64:" + str;
      }
      function raise2(message) {
        var error = new Error("(regl) " + message);
        console.error(error);
        throw error;
      }
      function check(pred, message) {
        if (!pred) {
          raise2(message);
        }
      }
      function encolon(message) {
        if (message) {
          return ": " + message;
        }
        return "";
      }
      function checkParameter(param, possibilities, message) {
        if (!(param in possibilities)) {
          raise2("unknown parameter (" + param + ")" + encolon(message) + ". possible values: " + Object.keys(possibilities).join());
        }
      }
      function checkIsTypedArray(data, message) {
        if (!isTypedArray(data)) {
          raise2(
            "invalid parameter type" + encolon(message) + ". must be a typed array"
          );
        }
      }
      function standardTypeEh(value, type2) {
        switch (type2) {
          case "number":
            return typeof value === "number";
          case "object":
            return typeof value === "object";
          case "string":
            return typeof value === "string";
          case "boolean":
            return typeof value === "boolean";
          case "function":
            return typeof value === "function";
          case "undefined":
            return typeof value === "undefined";
          case "symbol":
            return typeof value === "symbol";
        }
      }
      function checkTypeOf(value, type2, message) {
        if (!standardTypeEh(value, type2)) {
          raise2(
            "invalid parameter type" + encolon(message) + ". expected " + type2 + ", got " + typeof value
          );
        }
      }
      function checkNonNegativeInt(value, message) {
        if (!(value >= 0 && (value | 0) === value)) {
          raise2("invalid parameter type, (" + value + ")" + encolon(message) + ". must be a nonnegative integer");
        }
      }
      function checkOneOf(value, list, message) {
        if (list.indexOf(value) < 0) {
          raise2("invalid value" + encolon(message) + ". must be one of: " + list);
        }
      }
      var constructorKeys = [
        "gl",
        "canvas",
        "container",
        "attributes",
        "pixelRatio",
        "extensions",
        "optionalExtensions",
        "profile",
        "onDone"
      ];
      function checkConstructor(obj) {
        Object.keys(obj).forEach(function(key) {
          if (constructorKeys.indexOf(key) < 0) {
            raise2('invalid regl constructor argument "' + key + '". must be one of ' + constructorKeys);
          }
        });
      }
      function leftPad(str, n) {
        str = str + "";
        while (str.length < n) {
          str = " " + str;
        }
        return str;
      }
      function ShaderFile() {
        this.name = "unknown";
        this.lines = [];
        this.index = {};
        this.hasErrors = false;
      }
      function ShaderLine(number4, line2) {
        this.number = number4;
        this.line = line2;
        this.errors = [];
      }
      function ShaderError(fileNumber, lineNumber, message) {
        this.file = fileNumber;
        this.line = lineNumber;
        this.message = message;
      }
      function guessCommand() {
        var error = new Error();
        var stack = (error.stack || error).toString();
        var pat = /compileProcedure.*\n\s*at.*\((.*)\)/.exec(stack);
        if (pat) {
          return pat[1];
        }
        var pat2 = /compileProcedure.*\n\s*at\s+(.*)(\n|$)/.exec(stack);
        if (pat2) {
          return pat2[1];
        }
        return "unknown";
      }
      function guessCallSite() {
        var error = new Error();
        var stack = (error.stack || error).toString();
        var pat = /at REGLCommand.*\n\s+at.*\((.*)\)/.exec(stack);
        if (pat) {
          return pat[1];
        }
        var pat2 = /at REGLCommand.*\n\s+at\s+(.*)\n/.exec(stack);
        if (pat2) {
          return pat2[1];
        }
        return "unknown";
      }
      function parseSource(source, command) {
        var lines3 = source.split("\n");
        var lineNumber = 1;
        var fileNumber = 0;
        var files = {
          unknown: new ShaderFile(),
          0: new ShaderFile()
        };
        files.unknown.name = files[0].name = command || guessCommand();
        files.unknown.lines.push(new ShaderLine(0, ""));
        for (var i = 0; i < lines3.length; ++i) {
          var line2 = lines3[i];
          var parts = /^\s*#\s*(\w+)\s+(.+)\s*$/.exec(line2);
          if (parts) {
            switch (parts[1]) {
              case "line":
                var lineNumberInfo = /(\d+)(\s+\d+)?/.exec(parts[2]);
                if (lineNumberInfo) {
                  lineNumber = lineNumberInfo[1] | 0;
                  if (lineNumberInfo[2]) {
                    fileNumber = lineNumberInfo[2] | 0;
                    if (!(fileNumber in files)) {
                      files[fileNumber] = new ShaderFile();
                    }
                  }
                }
                break;
              case "define":
                var nameInfo = /SHADER_NAME(_B64)?\s+(.*)$/.exec(parts[2]);
                if (nameInfo) {
                  files[fileNumber].name = nameInfo[1] ? decodeB64(nameInfo[2]) : nameInfo[2];
                }
                break;
            }
          }
          files[fileNumber].lines.push(new ShaderLine(lineNumber++, line2));
        }
        Object.keys(files).forEach(function(fileNumber2) {
          var file = files[fileNumber2];
          file.lines.forEach(function(line3) {
            file.index[line3.number] = line3;
          });
        });
        return files;
      }
      function parseErrorLog(errLog) {
        var result = [];
        errLog.split("\n").forEach(function(errMsg) {
          if (errMsg.length < 5) {
            return;
          }
          var parts = /^ERROR:\s+(\d+):(\d+):\s*(.*)$/.exec(errMsg);
          if (parts) {
            result.push(new ShaderError(
              parts[1] | 0,
              parts[2] | 0,
              parts[3].trim()
            ));
          } else if (errMsg.length > 0) {
            result.push(new ShaderError("unknown", 0, errMsg));
          }
        });
        return result;
      }
      function annotateFiles(files, errors) {
        errors.forEach(function(error) {
          var file = files[error.file];
          if (file) {
            var line2 = file.index[error.line];
            if (line2) {
              line2.errors.push(error);
              file.hasErrors = true;
              return;
            }
          }
          files.unknown.hasErrors = true;
          files.unknown.lines[0].errors.push(error);
        });
      }
      function checkShaderError(gl, shader, source, type2, command) {
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          var errLog = gl.getShaderInfoLog(shader);
          var typeName = type2 === gl.FRAGMENT_SHADER ? "fragment" : "vertex";
          checkCommandType(source, "string", typeName + " shader source must be a string", command);
          var files = parseSource(source, command);
          var errors = parseErrorLog(errLog);
          annotateFiles(files, errors);
          Object.keys(files).forEach(function(fileNumber) {
            var file = files[fileNumber];
            if (!file.hasErrors) {
              return;
            }
            var strings = [""];
            var styles = [""];
            function push(str, style) {
              strings.push(str);
              styles.push(style || "");
            }
            push("file number " + fileNumber + ": " + file.name + "\n", "color:red;text-decoration:underline;font-weight:bold");
            file.lines.forEach(function(line2) {
              if (line2.errors.length > 0) {
                push(leftPad(line2.number, 4) + "|  ", "background-color:yellow; font-weight:bold");
                push(line2.line + endl, "color:red; background-color:yellow; font-weight:bold");
                var offset = 0;
                line2.errors.forEach(function(error) {
                  var message = error.message;
                  var token = /^\s*'(.*)'\s*:\s*(.*)$/.exec(message);
                  if (token) {
                    var tokenPat = token[1];
                    message = token[2];
                    switch (tokenPat) {
                      case "assign":
                        tokenPat = "=";
                        break;
                    }
                    offset = Math.max(line2.line.indexOf(tokenPat, offset), 0);
                  } else {
                    offset = 0;
                  }
                  push(leftPad("| ", 6));
                  push(leftPad("^^^", offset + 3) + endl, "font-weight:bold");
                  push(leftPad("| ", 6));
                  push(message + endl, "font-weight:bold");
                });
                push(leftPad("| ", 6) + endl);
              } else {
                push(leftPad(line2.number, 4) + "|  ");
                push(line2.line + endl, "color:red");
              }
            });
            if (typeof document !== "undefined" && !window.chrome) {
              styles[0] = strings.join("%c");
              console.log.apply(console, styles);
            } else {
              console.log(strings.join(""));
            }
          });
          check.raise("Error compiling " + typeName + " shader, " + files[0].name);
        }
      }
      function checkLinkError(gl, program, fragShader, vertShader, command) {
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          var errLog = gl.getProgramInfoLog(program);
          var fragParse = parseSource(fragShader, command);
          var vertParse = parseSource(vertShader, command);
          var header = 'Error linking program with vertex shader, "' + vertParse[0].name + '", and fragment shader "' + fragParse[0].name + '"';
          if (typeof document !== "undefined") {
            console.log(
              "%c" + header + endl + "%c" + errLog,
              "color:red;text-decoration:underline;font-weight:bold",
              "color:red"
            );
          } else {
            console.log(header + endl + errLog);
          }
          check.raise(header);
        }
      }
      function saveCommandRef(object) {
        object._commandRef = guessCommand();
      }
      function saveDrawCommandInfo(opts, uniforms, attributes, stringStore) {
        saveCommandRef(opts);
        function id2(str) {
          if (str) {
            return stringStore.id(str);
          }
          return 0;
        }
        opts._fragId = id2(opts.static.frag);
        opts._vertId = id2(opts.static.vert);
        function addProps(dict, set3) {
          Object.keys(set3).forEach(function(u) {
            dict[stringStore.id(u)] = true;
          });
        }
        var uniformSet = opts._uniformSet = {};
        addProps(uniformSet, uniforms.static);
        addProps(uniformSet, uniforms.dynamic);
        var attributeSet = opts._attributeSet = {};
        addProps(attributeSet, attributes.static);
        addProps(attributeSet, attributes.dynamic);
        opts._hasCount = "count" in opts.static || "count" in opts.dynamic || "elements" in opts.static || "elements" in opts.dynamic;
      }
      function commandRaise(message, command) {
        var callSite = guessCallSite();
        raise2(message + " in command " + (command || guessCommand()) + (callSite === "unknown" ? "" : " called from " + callSite));
      }
      function checkCommand(pred, message, command) {
        if (!pred) {
          commandRaise(message, command || guessCommand());
        }
      }
      function checkParameterCommand(param, possibilities, message, command) {
        if (!(param in possibilities)) {
          commandRaise(
            "unknown parameter (" + param + ")" + encolon(message) + ". possible values: " + Object.keys(possibilities).join(),
            command || guessCommand()
          );
        }
      }
      function checkCommandType(value, type2, message, command) {
        if (!standardTypeEh(value, type2)) {
          commandRaise(
            "invalid parameter type" + encolon(message) + ". expected " + type2 + ", got " + typeof value,
            command || guessCommand()
          );
        }
      }
      function checkOptional(block) {
        block();
      }
      function checkFramebufferFormat(attachment, texFormats, rbFormats) {
        if (attachment.texture) {
          checkOneOf(
            attachment.texture._texture.internalformat,
            texFormats,
            "unsupported texture format for attachment"
          );
        } else {
          checkOneOf(
            attachment.renderbuffer._renderbuffer.format,
            rbFormats,
            "unsupported renderbuffer format for attachment"
          );
        }
      }
      var GL_CLAMP_TO_EDGE = 33071;
      var GL_NEAREST = 9728;
      var GL_NEAREST_MIPMAP_NEAREST = 9984;
      var GL_LINEAR_MIPMAP_NEAREST = 9985;
      var GL_NEAREST_MIPMAP_LINEAR = 9986;
      var GL_LINEAR_MIPMAP_LINEAR = 9987;
      var GL_BYTE = 5120;
      var GL_UNSIGNED_BYTE = 5121;
      var GL_SHORT = 5122;
      var GL_UNSIGNED_SHORT = 5123;
      var GL_INT = 5124;
      var GL_UNSIGNED_INT = 5125;
      var GL_FLOAT = 5126;
      var GL_UNSIGNED_SHORT_4_4_4_4 = 32819;
      var GL_UNSIGNED_SHORT_5_5_5_1 = 32820;
      var GL_UNSIGNED_SHORT_5_6_5 = 33635;
      var GL_UNSIGNED_INT_24_8_WEBGL = 34042;
      var GL_HALF_FLOAT_OES = 36193;
      var TYPE_SIZE = {};
      TYPE_SIZE[GL_BYTE] = TYPE_SIZE[GL_UNSIGNED_BYTE] = 1;
      TYPE_SIZE[GL_SHORT] = TYPE_SIZE[GL_UNSIGNED_SHORT] = TYPE_SIZE[GL_HALF_FLOAT_OES] = TYPE_SIZE[GL_UNSIGNED_SHORT_5_6_5] = TYPE_SIZE[GL_UNSIGNED_SHORT_4_4_4_4] = TYPE_SIZE[GL_UNSIGNED_SHORT_5_5_5_1] = 2;
      TYPE_SIZE[GL_INT] = TYPE_SIZE[GL_UNSIGNED_INT] = TYPE_SIZE[GL_FLOAT] = TYPE_SIZE[GL_UNSIGNED_INT_24_8_WEBGL] = 4;
      function pixelSize(type2, channels) {
        if (type2 === GL_UNSIGNED_SHORT_5_5_5_1 || type2 === GL_UNSIGNED_SHORT_4_4_4_4 || type2 === GL_UNSIGNED_SHORT_5_6_5) {
          return 2;
        } else if (type2 === GL_UNSIGNED_INT_24_8_WEBGL) {
          return 4;
        } else {
          return TYPE_SIZE[type2] * channels;
        }
      }
      function isPow2(v) {
        return !(v & v - 1) && !!v;
      }
      function checkTexture2D(info, mipData, limits) {
        var i;
        var w = mipData.width;
        var h3 = mipData.height;
        var c = mipData.channels;
        check(
          w > 0 && w <= limits.maxTextureSize && h3 > 0 && h3 <= limits.maxTextureSize,
          "invalid texture shape"
        );
        if (info.wrapS !== GL_CLAMP_TO_EDGE || info.wrapT !== GL_CLAMP_TO_EDGE) {
          check(
            isPow2(w) && isPow2(h3),
            "incompatible wrap mode for texture, both width and height must be power of 2"
          );
        }
        if (mipData.mipmask === 1) {
          if (w !== 1 && h3 !== 1) {
            check(
              info.minFilter !== GL_NEAREST_MIPMAP_NEAREST && info.minFilter !== GL_NEAREST_MIPMAP_LINEAR && info.minFilter !== GL_LINEAR_MIPMAP_NEAREST && info.minFilter !== GL_LINEAR_MIPMAP_LINEAR,
              "min filter requires mipmap"
            );
          }
        } else {
          check(
            isPow2(w) && isPow2(h3),
            "texture must be a square power of 2 to support mipmapping"
          );
          check(
            mipData.mipmask === (w << 1) - 1,
            "missing or incomplete mipmap data"
          );
        }
        if (mipData.type === GL_FLOAT) {
          if (limits.extensions.indexOf("oes_texture_float_linear") < 0) {
            check(
              info.minFilter === GL_NEAREST && info.magFilter === GL_NEAREST,
              "filter not supported, must enable oes_texture_float_linear"
            );
          }
          check(
            !info.genMipmaps,
            "mipmap generation not supported with float textures"
          );
        }
        var mipimages = mipData.images;
        for (i = 0; i < 16; ++i) {
          if (mipimages[i]) {
            var mw = w >> i;
            var mh = h3 >> i;
            check(mipData.mipmask & 1 << i, "missing mipmap data");
            var img = mipimages[i];
            check(
              img.width === mw && img.height === mh,
              "invalid shape for mip images"
            );
            check(
              img.format === mipData.format && img.internalformat === mipData.internalformat && img.type === mipData.type,
              "incompatible type for mip image"
            );
            if (img.compressed) {
            } else if (img.data) {
              var rowSize = Math.ceil(pixelSize(img.type, c) * mw / img.unpackAlignment) * img.unpackAlignment;
              check(
                img.data.byteLength === rowSize * mh,
                "invalid data for image, buffer size is inconsistent with image format"
              );
            } else if (img.element) {
            } else if (img.copy) {
            }
          } else if (!info.genMipmaps) {
            check((mipData.mipmask & 1 << i) === 0, "extra mipmap data");
          }
        }
        if (mipData.compressed) {
          check(
            !info.genMipmaps,
            "mipmap generation for compressed images not supported"
          );
        }
      }
      function checkTextureCube(texture, info, faces, limits) {
        var w = texture.width;
        var h3 = texture.height;
        var c = texture.channels;
        check(
          w > 0 && w <= limits.maxTextureSize && h3 > 0 && h3 <= limits.maxTextureSize,
          "invalid texture shape"
        );
        check(
          w === h3,
          "cube map must be square"
        );
        check(
          info.wrapS === GL_CLAMP_TO_EDGE && info.wrapT === GL_CLAMP_TO_EDGE,
          "wrap mode not supported by cube map"
        );
        for (var i = 0; i < faces.length; ++i) {
          var face = faces[i];
          check(
            face.width === w && face.height === h3,
            "inconsistent cube map face shape"
          );
          if (info.genMipmaps) {
            check(
              !face.compressed,
              "can not generate mipmap for compressed textures"
            );
            check(
              face.mipmask === 1,
              "can not specify mipmaps and generate mipmaps"
            );
          } else {
          }
          var mipmaps = face.images;
          for (var j = 0; j < 16; ++j) {
            var img = mipmaps[j];
            if (img) {
              var mw = w >> j;
              var mh = h3 >> j;
              check(face.mipmask & 1 << j, "missing mipmap data");
              check(
                img.width === mw && img.height === mh,
                "invalid shape for mip images"
              );
              check(
                img.format === texture.format && img.internalformat === texture.internalformat && img.type === texture.type,
                "incompatible type for mip image"
              );
              if (img.compressed) {
              } else if (img.data) {
                check(
                  img.data.byteLength === mw * mh * Math.max(pixelSize(img.type, c), img.unpackAlignment),
                  "invalid data for image, buffer size is inconsistent with image format"
                );
              } else if (img.element) {
              } else if (img.copy) {
              }
            }
          }
        }
      }
      var check$1 = extend2(check, {
        optional: checkOptional,
        raise: raise2,
        commandRaise,
        command: checkCommand,
        parameter: checkParameter,
        commandParameter: checkParameterCommand,
        constructor: checkConstructor,
        type: checkTypeOf,
        commandType: checkCommandType,
        isTypedArray: checkIsTypedArray,
        nni: checkNonNegativeInt,
        oneOf: checkOneOf,
        shaderError: checkShaderError,
        linkError: checkLinkError,
        callSite: guessCallSite,
        saveCommandRef,
        saveDrawInfo: saveDrawCommandInfo,
        framebufferFormat: checkFramebufferFormat,
        guessCommand,
        texture2D: checkTexture2D,
        textureCube: checkTextureCube
      });
      var VARIABLE_COUNTER = 0;
      var DYN_FUNC = 0;
      var DYN_CONSTANT = 5;
      var DYN_ARRAY = 6;
      function DynamicVariable(type2, data) {
        this.id = VARIABLE_COUNTER++;
        this.type = type2;
        this.data = data;
      }
      function escapeStr(str) {
        return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      }
      function splitParts(str) {
        if (str.length === 0) {
          return [];
        }
        var firstChar = str.charAt(0);
        var lastChar = str.charAt(str.length - 1);
        if (str.length > 1 && firstChar === lastChar && (firstChar === '"' || firstChar === "'")) {
          return ['"' + escapeStr(str.substr(1, str.length - 2)) + '"'];
        }
        var parts = /\[(false|true|null|\d+|'[^']*'|"[^"]*")\]/.exec(str);
        if (parts) {
          return splitParts(str.substr(0, parts.index)).concat(splitParts(parts[1])).concat(splitParts(str.substr(parts.index + parts[0].length)));
        }
        var subparts = str.split(".");
        if (subparts.length === 1) {
          return ['"' + escapeStr(str) + '"'];
        }
        var result = [];
        for (var i = 0; i < subparts.length; ++i) {
          result = result.concat(splitParts(subparts[i]));
        }
        return result;
      }
      function toAccessorString(str) {
        return "[" + splitParts(str).join("][") + "]";
      }
      function defineDynamic(type2, data) {
        return new DynamicVariable(type2, toAccessorString(data + ""));
      }
      function isDynamic(x2) {
        return typeof x2 === "function" && !x2._reglType || x2 instanceof DynamicVariable;
      }
      function unbox(x2, path2) {
        if (typeof x2 === "function") {
          return new DynamicVariable(DYN_FUNC, x2);
        } else if (typeof x2 === "number" || typeof x2 === "boolean") {
          return new DynamicVariable(DYN_CONSTANT, x2);
        } else if (Array.isArray(x2)) {
          return new DynamicVariable(DYN_ARRAY, x2.map(function(y2, i) {
            return unbox(y2, path2 + "[" + i + "]");
          }));
        } else if (x2 instanceof DynamicVariable) {
          return x2;
        }
        check$1(false, "invalid option type in uniform " + path2);
      }
      var dynamic = {
        DynamicVariable,
        define: defineDynamic,
        isDynamic,
        unbox,
        accessor: toAccessorString
      };
      var raf = {
        next: typeof requestAnimationFrame === "function" ? function(cb) {
          return requestAnimationFrame(cb);
        } : function(cb) {
          return setTimeout(cb, 16);
        },
        cancel: typeof cancelAnimationFrame === "function" ? function(raf2) {
          return cancelAnimationFrame(raf2);
        } : clearTimeout
      };
      var clock2 = typeof performance !== "undefined" && performance.now ? function() {
        return performance.now();
      } : function() {
        return +/* @__PURE__ */ new Date();
      };
      function createStringStore() {
        var stringIds = { "": 0 };
        var stringValues = [""];
        return {
          id: function(str) {
            var result = stringIds[str];
            if (result) {
              return result;
            }
            result = stringIds[str] = stringValues.length;
            stringValues.push(str);
            return result;
          },
          str: function(id2) {
            return stringValues[id2];
          }
        };
      }
      function createCanvas(element, onDone, pixelRatio) {
        var canvas = document.createElement("canvas");
        extend2(canvas.style, {
          border: 0,
          margin: 0,
          padding: 0,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%"
        });
        element.appendChild(canvas);
        if (element === document.body) {
          canvas.style.position = "absolute";
          extend2(element.style, {
            margin: 0,
            padding: 0
          });
        }
        function resize() {
          var w = window.innerWidth;
          var h3 = window.innerHeight;
          if (element !== document.body) {
            var bounds = canvas.getBoundingClientRect();
            w = bounds.right - bounds.left;
            h3 = bounds.bottom - bounds.top;
          }
          canvas.width = pixelRatio * w;
          canvas.height = pixelRatio * h3;
        }
        var resizeObserver;
        if (element !== document.body && typeof ResizeObserver === "function") {
          resizeObserver = new ResizeObserver(function() {
            setTimeout(resize);
          });
          resizeObserver.observe(element);
        } else {
          window.addEventListener("resize", resize, false);
        }
        function onDestroy() {
          if (resizeObserver) {
            resizeObserver.disconnect();
          } else {
            window.removeEventListener("resize", resize);
          }
          element.removeChild(canvas);
        }
        resize();
        return {
          canvas,
          onDestroy
        };
      }
      function createContext(canvas, contextAttributes) {
        function get4(name) {
          try {
            return canvas.getContext(name, contextAttributes);
          } catch (e) {
            return null;
          }
        }
        return get4("webgl") || get4("experimental-webgl") || get4("webgl-experimental");
      }
      function isHTMLElement(obj) {
        return typeof obj.nodeName === "string" && typeof obj.appendChild === "function" && typeof obj.getBoundingClientRect === "function";
      }
      function isWebGLContext(obj) {
        return typeof obj.drawArrays === "function" || typeof obj.drawElements === "function";
      }
      function parseExtensions(input) {
        if (typeof input === "string") {
          return input.split();
        }
        check$1(Array.isArray(input), "invalid extension array");
        return input;
      }
      function getElement(desc) {
        if (typeof desc === "string") {
          check$1(typeof document !== "undefined", "not supported outside of DOM");
          return document.querySelector(desc);
        }
        return desc;
      }
      function parseArgs(args_) {
        var args = args_ || {};
        var element, container, canvas, gl;
        var contextAttributes = {};
        var extensions = [];
        var optionalExtensions = [];
        var pixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio;
        var profile = false;
        var onDone = function(err) {
          if (err) {
            check$1.raise(err);
          }
        };
        var onDestroy = function() {
        };
        if (typeof args === "string") {
          check$1(
            typeof document !== "undefined",
            "selector queries only supported in DOM environments"
          );
          element = document.querySelector(args);
          check$1(element, "invalid query string for element");
        } else if (typeof args === "object") {
          if (isHTMLElement(args)) {
            element = args;
          } else if (isWebGLContext(args)) {
            gl = args;
            canvas = gl.canvas;
          } else {
            check$1.constructor(args);
            if ("gl" in args) {
              gl = args.gl;
            } else if ("canvas" in args) {
              canvas = getElement(args.canvas);
            } else if ("container" in args) {
              container = getElement(args.container);
            }
            if ("attributes" in args) {
              contextAttributes = args.attributes;
              check$1.type(contextAttributes, "object", "invalid context attributes");
            }
            if ("extensions" in args) {
              extensions = parseExtensions(args.extensions);
            }
            if ("optionalExtensions" in args) {
              optionalExtensions = parseExtensions(args.optionalExtensions);
            }
            if ("onDone" in args) {
              check$1.type(
                args.onDone,
                "function",
                "invalid or missing onDone callback"
              );
              onDone = args.onDone;
            }
            if ("profile" in args) {
              profile = !!args.profile;
            }
            if ("pixelRatio" in args) {
              pixelRatio = +args.pixelRatio;
              check$1(pixelRatio > 0, "invalid pixel ratio");
            }
          }
        } else {
          check$1.raise("invalid arguments to regl");
        }
        if (element) {
          if (element.nodeName.toLowerCase() === "canvas") {
            canvas = element;
          } else {
            container = element;
          }
        }
        if (!gl) {
          if (!canvas) {
            check$1(
              typeof document !== "undefined",
              "must manually specify webgl context outside of DOM environments"
            );
            var result = createCanvas(container || document.body, onDone, pixelRatio);
            if (!result) {
              return null;
            }
            canvas = result.canvas;
            onDestroy = result.onDestroy;
          }
          if (contextAttributes.premultipliedAlpha === void 0) contextAttributes.premultipliedAlpha = true;
          gl = createContext(canvas, contextAttributes);
        }
        if (!gl) {
          onDestroy();
          onDone("webgl not supported, try upgrading your browser or graphics drivers http://get.webgl.org");
          return null;
        }
        return {
          gl,
          canvas,
          container,
          extensions,
          optionalExtensions,
          pixelRatio,
          profile,
          onDone,
          onDestroy
        };
      }
      function createExtensionCache(gl, config) {
        var extensions = {};
        function tryLoadExtension(name_) {
          check$1.type(name_, "string", "extension name must be string");
          var name2 = name_.toLowerCase();
          var ext;
          try {
            ext = extensions[name2] = gl.getExtension(name2);
          } catch (e) {
          }
          return !!ext;
        }
        for (var i = 0; i < config.extensions.length; ++i) {
          var name = config.extensions[i];
          if (!tryLoadExtension(name)) {
            config.onDestroy();
            config.onDone('"' + name + '" extension is not supported by the current WebGL context, try upgrading your system or a different browser');
            return null;
          }
        }
        config.optionalExtensions.forEach(tryLoadExtension);
        return {
          extensions,
          restore: function() {
            Object.keys(extensions).forEach(function(name2) {
              if (extensions[name2] && !tryLoadExtension(name2)) {
                throw new Error("(regl): error restoring extension " + name2);
              }
            });
          }
        };
      }
      function loop(n, f) {
        var result = Array(n);
        for (var i = 0; i < n; ++i) {
          result[i] = f(i);
        }
        return result;
      }
      var GL_BYTE$1 = 5120;
      var GL_UNSIGNED_BYTE$2 = 5121;
      var GL_SHORT$1 = 5122;
      var GL_UNSIGNED_SHORT$1 = 5123;
      var GL_INT$1 = 5124;
      var GL_UNSIGNED_INT$1 = 5125;
      var GL_FLOAT$2 = 5126;
      function nextPow16(v) {
        for (var i = 16; i <= 1 << 28; i *= 16) {
          if (v <= i) {
            return i;
          }
        }
        return 0;
      }
      function log2(v) {
        var r, shift;
        r = (v > 65535) << 4;
        v >>>= r;
        shift = (v > 255) << 3;
        v >>>= shift;
        r |= shift;
        shift = (v > 15) << 2;
        v >>>= shift;
        r |= shift;
        shift = (v > 3) << 1;
        v >>>= shift;
        r |= shift;
        return r | v >> 1;
      }
      function createPool() {
        var bufferPool = loop(8, function() {
          return [];
        });
        function alloc(n) {
          var sz = nextPow16(n);
          var bin = bufferPool[log2(sz) >> 2];
          if (bin.length > 0) {
            return bin.pop();
          }
          return new ArrayBuffer(sz);
        }
        function free(buf) {
          bufferPool[log2(buf.byteLength) >> 2].push(buf);
        }
        function allocType(type2, n) {
          var result = null;
          switch (type2) {
            case GL_BYTE$1:
              result = new Int8Array(alloc(n), 0, n);
              break;
            case GL_UNSIGNED_BYTE$2:
              result = new Uint8Array(alloc(n), 0, n);
              break;
            case GL_SHORT$1:
              result = new Int16Array(alloc(2 * n), 0, n);
              break;
            case GL_UNSIGNED_SHORT$1:
              result = new Uint16Array(alloc(2 * n), 0, n);
              break;
            case GL_INT$1:
              result = new Int32Array(alloc(4 * n), 0, n);
              break;
            case GL_UNSIGNED_INT$1:
              result = new Uint32Array(alloc(4 * n), 0, n);
              break;
            case GL_FLOAT$2:
              result = new Float32Array(alloc(4 * n), 0, n);
              break;
            default:
              return null;
          }
          if (result.length !== n) {
            return result.subarray(0, n);
          }
          return result;
        }
        function freeType(array2) {
          free(array2.buffer);
        }
        return {
          alloc,
          free,
          allocType,
          freeType
        };
      }
      var pool = createPool();
      pool.zero = createPool();
      var GL_SUBPIXEL_BITS = 3408;
      var GL_RED_BITS = 3410;
      var GL_GREEN_BITS = 3411;
      var GL_BLUE_BITS = 3412;
      var GL_ALPHA_BITS = 3413;
      var GL_DEPTH_BITS = 3414;
      var GL_STENCIL_BITS = 3415;
      var GL_ALIASED_POINT_SIZE_RANGE = 33901;
      var GL_ALIASED_LINE_WIDTH_RANGE = 33902;
      var GL_MAX_TEXTURE_SIZE = 3379;
      var GL_MAX_VIEWPORT_DIMS = 3386;
      var GL_MAX_VERTEX_ATTRIBS = 34921;
      var GL_MAX_VERTEX_UNIFORM_VECTORS = 36347;
      var GL_MAX_VARYING_VECTORS = 36348;
      var GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS = 35661;
      var GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS = 35660;
      var GL_MAX_TEXTURE_IMAGE_UNITS = 34930;
      var GL_MAX_FRAGMENT_UNIFORM_VECTORS = 36349;
      var GL_MAX_CUBE_MAP_TEXTURE_SIZE = 34076;
      var GL_MAX_RENDERBUFFER_SIZE = 34024;
      var GL_VENDOR = 7936;
      var GL_RENDERER = 7937;
      var GL_VERSION = 7938;
      var GL_SHADING_LANGUAGE_VERSION = 35724;
      var GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT = 34047;
      var GL_MAX_COLOR_ATTACHMENTS_WEBGL = 36063;
      var GL_MAX_DRAW_BUFFERS_WEBGL = 34852;
      var GL_TEXTURE_2D = 3553;
      var GL_TEXTURE_CUBE_MAP = 34067;
      var GL_TEXTURE_CUBE_MAP_POSITIVE_X = 34069;
      var GL_TEXTURE0 = 33984;
      var GL_RGBA = 6408;
      var GL_FLOAT$1 = 5126;
      var GL_UNSIGNED_BYTE$1 = 5121;
      var GL_FRAMEBUFFER = 36160;
      var GL_FRAMEBUFFER_COMPLETE = 36053;
      var GL_COLOR_ATTACHMENT0 = 36064;
      var GL_COLOR_BUFFER_BIT$1 = 16384;
      var wrapLimits = function(gl, extensions) {
        var maxAnisotropic = 1;
        if (extensions.ext_texture_filter_anisotropic) {
          maxAnisotropic = gl.getParameter(GL_MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        }
        var maxDrawbuffers = 1;
        var maxColorAttachments = 1;
        if (extensions.webgl_draw_buffers) {
          maxDrawbuffers = gl.getParameter(GL_MAX_DRAW_BUFFERS_WEBGL);
          maxColorAttachments = gl.getParameter(GL_MAX_COLOR_ATTACHMENTS_WEBGL);
        }
        var readFloat = !!extensions.oes_texture_float;
        if (readFloat) {
          var readFloatTexture = gl.createTexture();
          gl.bindTexture(GL_TEXTURE_2D, readFloatTexture);
          gl.texImage2D(GL_TEXTURE_2D, 0, GL_RGBA, 1, 1, 0, GL_RGBA, GL_FLOAT$1, null);
          var fbo = gl.createFramebuffer();
          gl.bindFramebuffer(GL_FRAMEBUFFER, fbo);
          gl.framebufferTexture2D(GL_FRAMEBUFFER, GL_COLOR_ATTACHMENT0, GL_TEXTURE_2D, readFloatTexture, 0);
          gl.bindTexture(GL_TEXTURE_2D, null);
          if (gl.checkFramebufferStatus(GL_FRAMEBUFFER) !== GL_FRAMEBUFFER_COMPLETE) readFloat = false;
          else {
            gl.viewport(0, 0, 1, 1);
            gl.clearColor(1, 0, 0, 1);
            gl.clear(GL_COLOR_BUFFER_BIT$1);
            var pixels = pool.allocType(GL_FLOAT$1, 4);
            gl.readPixels(0, 0, 1, 1, GL_RGBA, GL_FLOAT$1, pixels);
            if (gl.getError()) readFloat = false;
            else {
              gl.deleteFramebuffer(fbo);
              gl.deleteTexture(readFloatTexture);
              readFloat = pixels[0] === 1;
            }
            pool.freeType(pixels);
          }
        }
        var isIE = typeof navigator !== "undefined" && (/MSIE/.test(navigator.userAgent) || /Trident\//.test(navigator.appVersion) || /Edge/.test(navigator.userAgent));
        var npotTextureCube = true;
        if (!isIE) {
          var cubeTexture = gl.createTexture();
          var data = pool.allocType(GL_UNSIGNED_BYTE$1, 36);
          gl.activeTexture(GL_TEXTURE0);
          gl.bindTexture(GL_TEXTURE_CUBE_MAP, cubeTexture);
          gl.texImage2D(GL_TEXTURE_CUBE_MAP_POSITIVE_X, 0, GL_RGBA, 3, 3, 0, GL_RGBA, GL_UNSIGNED_BYTE$1, data);
          pool.freeType(data);
          gl.bindTexture(GL_TEXTURE_CUBE_MAP, null);
          gl.deleteTexture(cubeTexture);
          npotTextureCube = !gl.getError();
        }
        return {
          // drawing buffer bit depth
          colorBits: [
            gl.getParameter(GL_RED_BITS),
            gl.getParameter(GL_GREEN_BITS),
            gl.getParameter(GL_BLUE_BITS),
            gl.getParameter(GL_ALPHA_BITS)
          ],
          depthBits: gl.getParameter(GL_DEPTH_BITS),
          stencilBits: gl.getParameter(GL_STENCIL_BITS),
          subpixelBits: gl.getParameter(GL_SUBPIXEL_BITS),
          // supported extensions
          extensions: Object.keys(extensions).filter(function(ext) {
            return !!extensions[ext];
          }),
          // max aniso samples
          maxAnisotropic,
          // max draw buffers
          maxDrawbuffers,
          maxColorAttachments,
          // point and line size ranges
          pointSizeDims: gl.getParameter(GL_ALIASED_POINT_SIZE_RANGE),
          lineWidthDims: gl.getParameter(GL_ALIASED_LINE_WIDTH_RANGE),
          maxViewportDims: gl.getParameter(GL_MAX_VIEWPORT_DIMS),
          maxCombinedTextureUnits: gl.getParameter(GL_MAX_COMBINED_TEXTURE_IMAGE_UNITS),
          maxCubeMapSize: gl.getParameter(GL_MAX_CUBE_MAP_TEXTURE_SIZE),
          maxRenderbufferSize: gl.getParameter(GL_MAX_RENDERBUFFER_SIZE),
          maxTextureUnits: gl.getParameter(GL_MAX_TEXTURE_IMAGE_UNITS),
          maxTextureSize: gl.getParameter(GL_MAX_TEXTURE_SIZE),
          maxAttributes: gl.getParameter(GL_MAX_VERTEX_ATTRIBS),
          maxVertexUniforms: gl.getParameter(GL_MAX_VERTEX_UNIFORM_VECTORS),
          maxVertexTextureUnits: gl.getParameter(GL_MAX_VERTEX_TEXTURE_IMAGE_UNITS),
          maxVaryingVectors: gl.getParameter(GL_MAX_VARYING_VECTORS),
          maxFragmentUniforms: gl.getParameter(GL_MAX_FRAGMENT_UNIFORM_VECTORS),
          // vendor info
          glsl: gl.getParameter(GL_SHADING_LANGUAGE_VERSION),
          renderer: gl.getParameter(GL_RENDERER),
          vendor: gl.getParameter(GL_VENDOR),
          version: gl.getParameter(GL_VERSION),
          // quirks
          readFloat,
          npotTextureCube
        };
      };
      function isNDArrayLike(obj) {
        return !!obj && typeof obj === "object" && Array.isArray(obj.shape) && Array.isArray(obj.stride) && typeof obj.offset === "number" && obj.shape.length === obj.stride.length && (Array.isArray(obj.data) || isTypedArray(obj.data));
      }
      var values = function(obj) {
        return Object.keys(obj).map(function(key) {
          return obj[key];
        });
      };
      var flattenUtils = {
        shape: arrayShape$1,
        flatten: flattenArray
      };
      function flatten1D(array2, nx, out) {
        for (var i = 0; i < nx; ++i) {
          out[i] = array2[i];
        }
      }
      function flatten2D(array2, nx, ny, out) {
        var ptr = 0;
        for (var i = 0; i < nx; ++i) {
          var row = array2[i];
          for (var j = 0; j < ny; ++j) {
            out[ptr++] = row[j];
          }
        }
      }
      function flatten3D(array2, nx, ny, nz, out, ptr_) {
        var ptr = ptr_;
        for (var i = 0; i < nx; ++i) {
          var row = array2[i];
          for (var j = 0; j < ny; ++j) {
            var col = row[j];
            for (var k = 0; k < nz; ++k) {
              out[ptr++] = col[k];
            }
          }
        }
      }
      function flattenRec(array2, shape, level, out, ptr) {
        var stride = 1;
        for (var i = level + 1; i < shape.length; ++i) {
          stride *= shape[i];
        }
        var n = shape[level];
        if (shape.length - level === 4) {
          var nx = shape[level + 1];
          var ny = shape[level + 2];
          var nz = shape[level + 3];
          for (i = 0; i < n; ++i) {
            flatten3D(array2[i], nx, ny, nz, out, ptr);
            ptr += stride;
          }
        } else {
          for (i = 0; i < n; ++i) {
            flattenRec(array2[i], shape, level + 1, out, ptr);
            ptr += stride;
          }
        }
      }
      function flattenArray(array2, shape, type2, out_) {
        var sz = 1;
        if (shape.length) {
          for (var i = 0; i < shape.length; ++i) {
            sz *= shape[i];
          }
        } else {
          sz = 0;
        }
        var out = out_ || pool.allocType(type2, sz);
        switch (shape.length) {
          case 0:
            break;
          case 1:
            flatten1D(array2, shape[0], out);
            break;
          case 2:
            flatten2D(array2, shape[0], shape[1], out);
            break;
          case 3:
            flatten3D(array2, shape[0], shape[1], shape[2], out, 0);
            break;
          default:
            flattenRec(array2, shape, 0, out, 0);
        }
        return out;
      }
      function arrayShape$1(array_) {
        var shape = [];
        for (var array2 = array_; array2.length; array2 = array2[0]) {
          shape.push(array2.length);
        }
        return shape;
      }
      var arrayTypes = {
        "[object Int8Array]": 5120,
        "[object Int16Array]": 5122,
        "[object Int32Array]": 5124,
        "[object Uint8Array]": 5121,
        "[object Uint8ClampedArray]": 5121,
        "[object Uint16Array]": 5123,
        "[object Uint32Array]": 5125,
        "[object Float32Array]": 5126,
        "[object Float64Array]": 5121,
        "[object ArrayBuffer]": 5121
      };
      var int8 = 5120;
      var int16 = 5122;
      var int32 = 5124;
      var uint8 = 5121;
      var uint16 = 5123;
      var uint32 = 5125;
      var float = 5126;
      var float32 = 5126;
      var glTypes = {
        int8,
        int16,
        int32,
        uint8,
        uint16,
        uint32,
        float,
        float32
      };
      var dynamic$1 = 35048;
      var stream = 35040;
      var usageTypes = {
        dynamic: dynamic$1,
        stream,
        "static": 35044
      };
      var arrayFlatten = flattenUtils.flatten;
      var arrayShape = flattenUtils.shape;
      var GL_STATIC_DRAW = 35044;
      var GL_STREAM_DRAW = 35040;
      var GL_UNSIGNED_BYTE$3 = 5121;
      var GL_FLOAT$3 = 5126;
      var DTYPES_SIZES = [];
      DTYPES_SIZES[5120] = 1;
      DTYPES_SIZES[5122] = 2;
      DTYPES_SIZES[5124] = 4;
      DTYPES_SIZES[5121] = 1;
      DTYPES_SIZES[5123] = 2;
      DTYPES_SIZES[5125] = 4;
      DTYPES_SIZES[5126] = 4;
      function typedArrayCode(data) {
        return arrayTypes[Object.prototype.toString.call(data)] | 0;
      }
      function copyArray(out, inp) {
        for (var i = 0; i < inp.length; ++i) {
          out[i] = inp[i];
        }
      }
      function transpose(result, data, shapeX, shapeY, strideX, strideY, offset) {
        var ptr = 0;
        for (var i = 0; i < shapeX; ++i) {
          for (var j = 0; j < shapeY; ++j) {
            result[ptr++] = data[strideX * i + strideY * j + offset];
          }
        }
      }
      function wrapBufferState(gl, stats2, config, destroyBuffer) {
        var bufferCount = 0;
        var bufferSet = {};
        function REGLBuffer(type2) {
          this.id = bufferCount++;
          this.buffer = gl.createBuffer();
          this.type = type2;
          this.usage = GL_STATIC_DRAW;
          this.byteLength = 0;
          this.dimension = 1;
          this.dtype = GL_UNSIGNED_BYTE$3;
          this.persistentData = null;
          if (config.profile) {
            this.stats = { size: 0 };
          }
        }
        REGLBuffer.prototype.bind = function() {
          gl.bindBuffer(this.type, this.buffer);
        };
        REGLBuffer.prototype.destroy = function() {
          destroy(this);
        };
        var streamPool = [];
        function createStream(type2, data) {
          var buffer = streamPool.pop();
          if (!buffer) {
            buffer = new REGLBuffer(type2);
          }
          buffer.bind();
          initBufferFromData(buffer, data, GL_STREAM_DRAW, 0, 1, false);
          return buffer;
        }
        function destroyStream(stream$$1) {
          streamPool.push(stream$$1);
        }
        function initBufferFromTypedArray(buffer, data, usage) {
          buffer.byteLength = data.byteLength;
          gl.bufferData(buffer.type, data, usage);
        }
        function initBufferFromData(buffer, data, usage, dtype, dimension, persist) {
          var shape;
          buffer.usage = usage;
          if (Array.isArray(data)) {
            buffer.dtype = dtype || GL_FLOAT$3;
            if (data.length > 0) {
              var flatData;
              if (Array.isArray(data[0])) {
                shape = arrayShape(data);
                var dim = 1;
                for (var i = 1; i < shape.length; ++i) {
                  dim *= shape[i];
                }
                buffer.dimension = dim;
                flatData = arrayFlatten(data, shape, buffer.dtype);
                initBufferFromTypedArray(buffer, flatData, usage);
                if (persist) {
                  buffer.persistentData = flatData;
                } else {
                  pool.freeType(flatData);
                }
              } else if (typeof data[0] === "number") {
                buffer.dimension = dimension;
                var typedData = pool.allocType(buffer.dtype, data.length);
                copyArray(typedData, data);
                initBufferFromTypedArray(buffer, typedData, usage);
                if (persist) {
                  buffer.persistentData = typedData;
                } else {
                  pool.freeType(typedData);
                }
              } else if (isTypedArray(data[0])) {
                buffer.dimension = data[0].length;
                buffer.dtype = dtype || typedArrayCode(data[0]) || GL_FLOAT$3;
                flatData = arrayFlatten(
                  data,
                  [data.length, data[0].length],
                  buffer.dtype
                );
                initBufferFromTypedArray(buffer, flatData, usage);
                if (persist) {
                  buffer.persistentData = flatData;
                } else {
                  pool.freeType(flatData);
                }
              } else {
                check$1.raise("invalid buffer data");
              }
            }
          } else if (isTypedArray(data)) {
            buffer.dtype = dtype || typedArrayCode(data);
            buffer.dimension = dimension;
            initBufferFromTypedArray(buffer, data, usage);
            if (persist) {
              buffer.persistentData = new Uint8Array(new Uint8Array(data.buffer));
            }
          } else if (isNDArrayLike(data)) {
            shape = data.shape;
            var stride = data.stride;
            var offset = data.offset;
            var shapeX = 0;
            var shapeY = 0;
            var strideX = 0;
            var strideY = 0;
            if (shape.length === 1) {
              shapeX = shape[0];
              shapeY = 1;
              strideX = stride[0];
              strideY = 0;
            } else if (shape.length === 2) {
              shapeX = shape[0];
              shapeY = shape[1];
              strideX = stride[0];
              strideY = stride[1];
            } else {
              check$1.raise("invalid shape");
            }
            buffer.dtype = dtype || typedArrayCode(data.data) || GL_FLOAT$3;
            buffer.dimension = shapeY;
            var transposeData2 = pool.allocType(buffer.dtype, shapeX * shapeY);
            transpose(
              transposeData2,
              data.data,
              shapeX,
              shapeY,
              strideX,
              strideY,
              offset
            );
            initBufferFromTypedArray(buffer, transposeData2, usage);
            if (persist) {
              buffer.persistentData = transposeData2;
            } else {
              pool.freeType(transposeData2);
            }
          } else if (data instanceof ArrayBuffer) {
            buffer.dtype = GL_UNSIGNED_BYTE$3;
            buffer.dimension = dimension;
            initBufferFromTypedArray(buffer, data, usage);
            if (persist) {
              buffer.persistentData = new Uint8Array(new Uint8Array(data));
            }
          } else {
            check$1.raise("invalid buffer data");
          }
        }
        function destroy(buffer) {
          stats2.bufferCount--;
          destroyBuffer(buffer);
          var handle = buffer.buffer;
          check$1(handle, "buffer must not be deleted already");
          gl.deleteBuffer(handle);
          buffer.buffer = null;
          delete bufferSet[buffer.id];
        }
        function createBuffer(options, type2, deferInit, persistent) {
          stats2.bufferCount++;
          var buffer = new REGLBuffer(type2);
          bufferSet[buffer.id] = buffer;
          function reglBuffer(options2) {
            var usage = GL_STATIC_DRAW;
            var data = null;
            var byteLength = 0;
            var dtype = 0;
            var dimension = 1;
            if (Array.isArray(options2) || isTypedArray(options2) || isNDArrayLike(options2) || options2 instanceof ArrayBuffer) {
              data = options2;
            } else if (typeof options2 === "number") {
              byteLength = options2 | 0;
            } else if (options2) {
              check$1.type(
                options2,
                "object",
                "buffer arguments must be an object, a number or an array"
              );
              if ("data" in options2) {
                check$1(
                  data === null || Array.isArray(data) || isTypedArray(data) || isNDArrayLike(data),
                  "invalid data for buffer"
                );
                data = options2.data;
              }
              if ("usage" in options2) {
                check$1.parameter(options2.usage, usageTypes, "invalid buffer usage");
                usage = usageTypes[options2.usage];
              }
              if ("type" in options2) {
                check$1.parameter(options2.type, glTypes, "invalid buffer type");
                dtype = glTypes[options2.type];
              }
              if ("dimension" in options2) {
                check$1.type(options2.dimension, "number", "invalid dimension");
                dimension = options2.dimension | 0;
              }
              if ("length" in options2) {
                check$1.nni(byteLength, "buffer length must be a nonnegative integer");
                byteLength = options2.length | 0;
              }
            }
            buffer.bind();
            if (!data) {
              if (byteLength) gl.bufferData(buffer.type, byteLength, usage);
              buffer.dtype = dtype || GL_UNSIGNED_BYTE$3;
              buffer.usage = usage;
              buffer.dimension = dimension;
              buffer.byteLength = byteLength;
            } else {
              initBufferFromData(buffer, data, usage, dtype, dimension, persistent);
            }
            if (config.profile) {
              buffer.stats.size = buffer.byteLength * DTYPES_SIZES[buffer.dtype];
            }
            return reglBuffer;
          }
          function setSubData(data, offset) {
            check$1(
              offset + data.byteLength <= buffer.byteLength,
              "invalid buffer subdata call, buffer is too small.  Can't write data of size " + data.byteLength + " starting from offset " + offset + " to a buffer of size " + buffer.byteLength
            );
            gl.bufferSubData(buffer.type, offset, data);
          }
          function subdata(data, offset_) {
            var offset = (offset_ || 0) | 0;
            var shape;
            buffer.bind();
            if (isTypedArray(data) || data instanceof ArrayBuffer) {
              setSubData(data, offset);
            } else if (Array.isArray(data)) {
              if (data.length > 0) {
                if (typeof data[0] === "number") {
                  var converted = pool.allocType(buffer.dtype, data.length);
                  copyArray(converted, data);
                  setSubData(converted, offset);
                  pool.freeType(converted);
                } else if (Array.isArray(data[0]) || isTypedArray(data[0])) {
                  shape = arrayShape(data);
                  var flatData = arrayFlatten(data, shape, buffer.dtype);
                  setSubData(flatData, offset);
                  pool.freeType(flatData);
                } else {
                  check$1.raise("invalid buffer data");
                }
              }
            } else if (isNDArrayLike(data)) {
              shape = data.shape;
              var stride = data.stride;
              var shapeX = 0;
              var shapeY = 0;
              var strideX = 0;
              var strideY = 0;
              if (shape.length === 1) {
                shapeX = shape[0];
                shapeY = 1;
                strideX = stride[0];
                strideY = 0;
              } else if (shape.length === 2) {
                shapeX = shape[0];
                shapeY = shape[1];
                strideX = stride[0];
                strideY = stride[1];
              } else {
                check$1.raise("invalid shape");
              }
              var dtype = Array.isArray(data.data) ? buffer.dtype : typedArrayCode(data.data);
              var transposeData2 = pool.allocType(dtype, shapeX * shapeY);
              transpose(
                transposeData2,
                data.data,
                shapeX,
                shapeY,
                strideX,
                strideY,
                data.offset
              );
              setSubData(transposeData2, offset);
              pool.freeType(transposeData2);
            } else {
              check$1.raise("invalid data for buffer subdata");
            }
            return reglBuffer;
          }
          if (!deferInit) {
            reglBuffer(options);
          }
          reglBuffer._reglType = "buffer";
          reglBuffer._buffer = buffer;
          reglBuffer.subdata = subdata;
          if (config.profile) {
            reglBuffer.stats = buffer.stats;
          }
          reglBuffer.destroy = function() {
            destroy(buffer);
          };
          return reglBuffer;
        }
        function restoreBuffers() {
          values(bufferSet).forEach(function(buffer) {
            buffer.buffer = gl.createBuffer();
            gl.bindBuffer(buffer.type, buffer.buffer);
            gl.bufferData(
              buffer.type,
              buffer.persistentData || buffer.byteLength,
              buffer.usage
            );
          });
        }
        if (config.profile) {
          stats2.getTotalBufferSize = function() {
            var total = 0;
            Object.keys(bufferSet).forEach(function(key) {
              total += bufferSet[key].stats.size;
            });
            return total;
          };
        }
        return {
          create: createBuffer,
          createStream,
          destroyStream,
          clear: function() {
            values(bufferSet).forEach(destroy);
            streamPool.forEach(destroy);
          },
          getBuffer: function(wrapper) {
            if (wrapper && wrapper._buffer instanceof REGLBuffer) {
              return wrapper._buffer;
            }
            return null;
          },
          restore: restoreBuffers,
          _initBuffer: initBufferFromData
        };
      }
      var points = 0;
      var point = 0;
      var lines2 = 1;
      var line = 1;
      var triangles = 4;
      var triangle = 4;
      var primTypes = {
        points,
        point,
        lines: lines2,
        line,
        triangles,
        triangle,
        "line loop": 2,
        "line strip": 3,
        "triangle strip": 5,
        "triangle fan": 6
      };
      var GL_POINTS = 0;
      var GL_LINES = 1;
      var GL_TRIANGLES = 4;
      var GL_BYTE$2 = 5120;
      var GL_UNSIGNED_BYTE$4 = 5121;
      var GL_SHORT$2 = 5122;
      var GL_UNSIGNED_SHORT$2 = 5123;
      var GL_INT$2 = 5124;
      var GL_UNSIGNED_INT$2 = 5125;
      var GL_ELEMENT_ARRAY_BUFFER = 34963;
      var GL_STREAM_DRAW$1 = 35040;
      var GL_STATIC_DRAW$1 = 35044;
      function wrapElementsState(gl, extensions, bufferState, stats2) {
        var elementSet = {};
        var elementCount = 0;
        var elementTypes = {
          "uint8": GL_UNSIGNED_BYTE$4,
          "uint16": GL_UNSIGNED_SHORT$2
        };
        if (extensions.oes_element_index_uint) {
          elementTypes.uint32 = GL_UNSIGNED_INT$2;
        }
        function REGLElementBuffer(buffer) {
          this.id = elementCount++;
          elementSet[this.id] = this;
          this.buffer = buffer;
          this.primType = GL_TRIANGLES;
          this.vertCount = 0;
          this.type = 0;
        }
        REGLElementBuffer.prototype.bind = function() {
          this.buffer.bind();
        };
        var bufferPool = [];
        function createElementStream(data) {
          var result = bufferPool.pop();
          if (!result) {
            result = new REGLElementBuffer(bufferState.create(
              null,
              GL_ELEMENT_ARRAY_BUFFER,
              true,
              false
            )._buffer);
          }
          initElements(result, data, GL_STREAM_DRAW$1, -1, -1, 0, 0);
          return result;
        }
        function destroyElementStream(elements) {
          bufferPool.push(elements);
        }
        function initElements(elements, data, usage, prim, count, byteLength, type2) {
          elements.buffer.bind();
          var dtype;
          if (data) {
            var predictedType = type2;
            if (!type2 && (!isTypedArray(data) || isNDArrayLike(data) && !isTypedArray(data.data))) {
              predictedType = extensions.oes_element_index_uint ? GL_UNSIGNED_INT$2 : GL_UNSIGNED_SHORT$2;
            }
            bufferState._initBuffer(
              elements.buffer,
              data,
              usage,
              predictedType,
              3
            );
          } else {
            gl.bufferData(GL_ELEMENT_ARRAY_BUFFER, byteLength, usage);
            elements.buffer.dtype = dtype || GL_UNSIGNED_BYTE$4;
            elements.buffer.usage = usage;
            elements.buffer.dimension = 3;
            elements.buffer.byteLength = byteLength;
          }
          dtype = type2;
          if (!type2) {
            switch (elements.buffer.dtype) {
              case GL_UNSIGNED_BYTE$4:
              case GL_BYTE$2:
                dtype = GL_UNSIGNED_BYTE$4;
                break;
              case GL_UNSIGNED_SHORT$2:
              case GL_SHORT$2:
                dtype = GL_UNSIGNED_SHORT$2;
                break;
              case GL_UNSIGNED_INT$2:
              case GL_INT$2:
                dtype = GL_UNSIGNED_INT$2;
                break;
              default:
                check$1.raise("unsupported type for element array");
            }
            elements.buffer.dtype = dtype;
          }
          elements.type = dtype;
          check$1(
            dtype !== GL_UNSIGNED_INT$2 || !!extensions.oes_element_index_uint,
            "32 bit element buffers not supported, enable oes_element_index_uint first"
          );
          var vertCount = count;
          if (vertCount < 0) {
            vertCount = elements.buffer.byteLength;
            if (dtype === GL_UNSIGNED_SHORT$2) {
              vertCount >>= 1;
            } else if (dtype === GL_UNSIGNED_INT$2) {
              vertCount >>= 2;
            }
          }
          elements.vertCount = vertCount;
          var primType = prim;
          if (prim < 0) {
            primType = GL_TRIANGLES;
            var dimension = elements.buffer.dimension;
            if (dimension === 1) primType = GL_POINTS;
            if (dimension === 2) primType = GL_LINES;
            if (dimension === 3) primType = GL_TRIANGLES;
          }
          elements.primType = primType;
        }
        function destroyElements(elements) {
          stats2.elementsCount--;
          check$1(elements.buffer !== null, "must not double destroy elements");
          delete elementSet[elements.id];
          elements.buffer.destroy();
          elements.buffer = null;
        }
        function createElements(options, persistent) {
          var buffer = bufferState.create(null, GL_ELEMENT_ARRAY_BUFFER, true);
          var elements = new REGLElementBuffer(buffer._buffer);
          stats2.elementsCount++;
          function reglElements(options2) {
            if (!options2) {
              buffer();
              elements.primType = GL_TRIANGLES;
              elements.vertCount = 0;
              elements.type = GL_UNSIGNED_BYTE$4;
            } else if (typeof options2 === "number") {
              buffer(options2);
              elements.primType = GL_TRIANGLES;
              elements.vertCount = options2 | 0;
              elements.type = GL_UNSIGNED_BYTE$4;
            } else {
              var data = null;
              var usage = GL_STATIC_DRAW$1;
              var primType = -1;
              var vertCount = -1;
              var byteLength = 0;
              var dtype = 0;
              if (Array.isArray(options2) || isTypedArray(options2) || isNDArrayLike(options2)) {
                data = options2;
              } else {
                check$1.type(options2, "object", "invalid arguments for elements");
                if ("data" in options2) {
                  data = options2.data;
                  check$1(
                    Array.isArray(data) || isTypedArray(data) || isNDArrayLike(data),
                    "invalid data for element buffer"
                  );
                }
                if ("usage" in options2) {
                  check$1.parameter(
                    options2.usage,
                    usageTypes,
                    "invalid element buffer usage"
                  );
                  usage = usageTypes[options2.usage];
                }
                if ("primitive" in options2) {
                  check$1.parameter(
                    options2.primitive,
                    primTypes,
                    "invalid element buffer primitive"
                  );
                  primType = primTypes[options2.primitive];
                }
                if ("count" in options2) {
                  check$1(
                    typeof options2.count === "number" && options2.count >= 0,
                    "invalid vertex count for elements"
                  );
                  vertCount = options2.count | 0;
                }
                if ("type" in options2) {
                  check$1.parameter(
                    options2.type,
                    elementTypes,
                    "invalid buffer type"
                  );
                  dtype = elementTypes[options2.type];
                }
                if ("length" in options2) {
                  byteLength = options2.length | 0;
                } else {
                  byteLength = vertCount;
                  if (dtype === GL_UNSIGNED_SHORT$2 || dtype === GL_SHORT$2) {
                    byteLength *= 2;
                  } else if (dtype === GL_UNSIGNED_INT$2 || dtype === GL_INT$2) {
                    byteLength *= 4;
                  }
                }
              }
              initElements(
                elements,
                data,
                usage,
                primType,
                vertCount,
                byteLength,
                dtype
              );
            }
            return reglElements;
          }
          reglElements(options);
          reglElements._reglType = "elements";
          reglElements._elements = elements;
          reglElements.subdata = function(data, offset) {
            buffer.subdata(data, offset);
            return reglElements;
          };
          reglElements.destroy = function() {
            destroyElements(elements);
          };
          return reglElements;
        }
        return {
          create: createElements,
          createStream: createElementStream,
          destroyStream: destroyElementStream,
          getElements: function(elements) {
            if (typeof elements === "function" && elements._elements instanceof REGLElementBuffer) {
              return elements._elements;
            }
            return null;
          },
          clear: function() {
            values(elementSet).forEach(destroyElements);
          }
        };
      }
      var FLOAT = new Float32Array(1);
      var INT = new Uint32Array(FLOAT.buffer);
      var GL_UNSIGNED_SHORT$4 = 5123;
      function convertToHalfFloat(array2) {
        var ushorts = pool.allocType(GL_UNSIGNED_SHORT$4, array2.length);
        for (var i = 0; i < array2.length; ++i) {
          if (isNaN(array2[i])) {
            ushorts[i] = 65535;
          } else if (array2[i] === Infinity) {
            ushorts[i] = 31744;
          } else if (array2[i] === -Infinity) {
            ushorts[i] = 64512;
          } else {
            FLOAT[0] = array2[i];
            var x2 = INT[0];
            var sgn = x2 >>> 31 << 15;
            var exp = (x2 << 1 >>> 24) - 127;
            var frac = x2 >> 13 & (1 << 10) - 1;
            if (exp < -24) {
              ushorts[i] = sgn;
            } else if (exp < -14) {
              var s = -14 - exp;
              ushorts[i] = sgn + (frac + (1 << 10) >> s);
            } else if (exp > 15) {
              ushorts[i] = sgn + 31744;
            } else {
              ushorts[i] = sgn + (exp + 15 << 10) + frac;
            }
          }
        }
        return ushorts;
      }
      function isArrayLike(s) {
        return Array.isArray(s) || isTypedArray(s);
      }
      var isPow2$1 = function(v) {
        return !(v & v - 1) && !!v;
      };
      var GL_COMPRESSED_TEXTURE_FORMATS = 34467;
      var GL_TEXTURE_2D$1 = 3553;
      var GL_TEXTURE_CUBE_MAP$1 = 34067;
      var GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 = 34069;
      var GL_RGBA$1 = 6408;
      var GL_ALPHA = 6406;
      var GL_RGB = 6407;
      var GL_LUMINANCE = 6409;
      var GL_LUMINANCE_ALPHA = 6410;
      var GL_RGBA4 = 32854;
      var GL_RGB5_A1 = 32855;
      var GL_RGB565 = 36194;
      var GL_UNSIGNED_SHORT_4_4_4_4$1 = 32819;
      var GL_UNSIGNED_SHORT_5_5_5_1$1 = 32820;
      var GL_UNSIGNED_SHORT_5_6_5$1 = 33635;
      var GL_UNSIGNED_INT_24_8_WEBGL$1 = 34042;
      var GL_DEPTH_COMPONENT = 6402;
      var GL_DEPTH_STENCIL = 34041;
      var GL_SRGB_EXT = 35904;
      var GL_SRGB_ALPHA_EXT = 35906;
      var GL_HALF_FLOAT_OES$1 = 36193;
      var GL_COMPRESSED_RGB_S3TC_DXT1_EXT = 33776;
      var GL_COMPRESSED_RGBA_S3TC_DXT1_EXT = 33777;
      var GL_COMPRESSED_RGBA_S3TC_DXT3_EXT = 33778;
      var GL_COMPRESSED_RGBA_S3TC_DXT5_EXT = 33779;
      var GL_COMPRESSED_RGB_ATC_WEBGL = 35986;
      var GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL = 35987;
      var GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL = 34798;
      var GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG = 35840;
      var GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG = 35841;
      var GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG = 35842;
      var GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG = 35843;
      var GL_COMPRESSED_RGB_ETC1_WEBGL = 36196;
      var GL_UNSIGNED_BYTE$5 = 5121;
      var GL_UNSIGNED_SHORT$3 = 5123;
      var GL_UNSIGNED_INT$3 = 5125;
      var GL_FLOAT$4 = 5126;
      var GL_TEXTURE_WRAP_S = 10242;
      var GL_TEXTURE_WRAP_T = 10243;
      var GL_REPEAT = 10497;
      var GL_CLAMP_TO_EDGE$1 = 33071;
      var GL_MIRRORED_REPEAT = 33648;
      var GL_TEXTURE_MAG_FILTER = 10240;
      var GL_TEXTURE_MIN_FILTER = 10241;
      var GL_NEAREST$1 = 9728;
      var GL_LINEAR = 9729;
      var GL_NEAREST_MIPMAP_NEAREST$1 = 9984;
      var GL_LINEAR_MIPMAP_NEAREST$1 = 9985;
      var GL_NEAREST_MIPMAP_LINEAR$1 = 9986;
      var GL_LINEAR_MIPMAP_LINEAR$1 = 9987;
      var GL_GENERATE_MIPMAP_HINT = 33170;
      var GL_DONT_CARE = 4352;
      var GL_FASTEST = 4353;
      var GL_NICEST = 4354;
      var GL_TEXTURE_MAX_ANISOTROPY_EXT = 34046;
      var GL_UNPACK_ALIGNMENT = 3317;
      var GL_UNPACK_FLIP_Y_WEBGL = 37440;
      var GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL = 37441;
      var GL_UNPACK_COLORSPACE_CONVERSION_WEBGL = 37443;
      var GL_BROWSER_DEFAULT_WEBGL = 37444;
      var GL_TEXTURE0$1 = 33984;
      var MIPMAP_FILTERS = [
        GL_NEAREST_MIPMAP_NEAREST$1,
        GL_NEAREST_MIPMAP_LINEAR$1,
        GL_LINEAR_MIPMAP_NEAREST$1,
        GL_LINEAR_MIPMAP_LINEAR$1
      ];
      var CHANNELS_FORMAT = [
        0,
        GL_LUMINANCE,
        GL_LUMINANCE_ALPHA,
        GL_RGB,
        GL_RGBA$1
      ];
      var FORMAT_CHANNELS = {};
      FORMAT_CHANNELS[GL_LUMINANCE] = FORMAT_CHANNELS[GL_ALPHA] = FORMAT_CHANNELS[GL_DEPTH_COMPONENT] = 1;
      FORMAT_CHANNELS[GL_DEPTH_STENCIL] = FORMAT_CHANNELS[GL_LUMINANCE_ALPHA] = 2;
      FORMAT_CHANNELS[GL_RGB] = FORMAT_CHANNELS[GL_SRGB_EXT] = 3;
      FORMAT_CHANNELS[GL_RGBA$1] = FORMAT_CHANNELS[GL_SRGB_ALPHA_EXT] = 4;
      function objectName(str) {
        return "[object " + str + "]";
      }
      var CANVAS_CLASS = objectName("HTMLCanvasElement");
      var OFFSCREENCANVAS_CLASS = objectName("OffscreenCanvas");
      var CONTEXT2D_CLASS = objectName("CanvasRenderingContext2D");
      var BITMAP_CLASS = objectName("ImageBitmap");
      var IMAGE_CLASS = objectName("HTMLImageElement");
      var VIDEO_CLASS = objectName("HTMLVideoElement");
      var PIXEL_CLASSES = Object.keys(arrayTypes).concat([
        CANVAS_CLASS,
        OFFSCREENCANVAS_CLASS,
        CONTEXT2D_CLASS,
        BITMAP_CLASS,
        IMAGE_CLASS,
        VIDEO_CLASS
      ]);
      var TYPE_SIZES = [];
      TYPE_SIZES[GL_UNSIGNED_BYTE$5] = 1;
      TYPE_SIZES[GL_FLOAT$4] = 4;
      TYPE_SIZES[GL_HALF_FLOAT_OES$1] = 2;
      TYPE_SIZES[GL_UNSIGNED_SHORT$3] = 2;
      TYPE_SIZES[GL_UNSIGNED_INT$3] = 4;
      var FORMAT_SIZES_SPECIAL = [];
      FORMAT_SIZES_SPECIAL[GL_RGBA4] = 2;
      FORMAT_SIZES_SPECIAL[GL_RGB5_A1] = 2;
      FORMAT_SIZES_SPECIAL[GL_RGB565] = 2;
      FORMAT_SIZES_SPECIAL[GL_DEPTH_STENCIL] = 4;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_S3TC_DXT1_EXT] = 0.5;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT1_EXT] = 0.5;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT3_EXT] = 1;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_S3TC_DXT5_EXT] = 1;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_ATC_WEBGL] = 0.5;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL] = 1;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL] = 1;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG] = 0.5;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG] = 0.25;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG] = 0.5;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG] = 0.25;
      FORMAT_SIZES_SPECIAL[GL_COMPRESSED_RGB_ETC1_WEBGL] = 0.5;
      function isNumericArray(arr) {
        return Array.isArray(arr) && (arr.length === 0 || typeof arr[0] === "number");
      }
      function isRectArray(arr) {
        if (!Array.isArray(arr)) {
          return false;
        }
        var width = arr.length;
        if (width === 0 || !isArrayLike(arr[0])) {
          return false;
        }
        return true;
      }
      function classString(x2) {
        return Object.prototype.toString.call(x2);
      }
      function isCanvasElement(object) {
        return classString(object) === CANVAS_CLASS;
      }
      function isOffscreenCanvas(object) {
        return classString(object) === OFFSCREENCANVAS_CLASS;
      }
      function isContext2D(object) {
        return classString(object) === CONTEXT2D_CLASS;
      }
      function isBitmap(object) {
        return classString(object) === BITMAP_CLASS;
      }
      function isImageElement(object) {
        return classString(object) === IMAGE_CLASS;
      }
      function isVideoElement(object) {
        return classString(object) === VIDEO_CLASS;
      }
      function isPixelData(object) {
        if (!object) {
          return false;
        }
        var className = classString(object);
        if (PIXEL_CLASSES.indexOf(className) >= 0) {
          return true;
        }
        return isNumericArray(object) || isRectArray(object) || isNDArrayLike(object);
      }
      function typedArrayCode$1(data) {
        return arrayTypes[Object.prototype.toString.call(data)] | 0;
      }
      function convertData(result, data) {
        var n = data.length;
        switch (result.type) {
          case GL_UNSIGNED_BYTE$5:
          case GL_UNSIGNED_SHORT$3:
          case GL_UNSIGNED_INT$3:
          case GL_FLOAT$4:
            var converted = pool.allocType(result.type, n);
            converted.set(data);
            result.data = converted;
            break;
          case GL_HALF_FLOAT_OES$1:
            result.data = convertToHalfFloat(data);
            break;
          default:
            check$1.raise("unsupported texture type, must specify a typed array");
        }
      }
      function preConvert(image, n) {
        return pool.allocType(
          image.type === GL_HALF_FLOAT_OES$1 ? GL_FLOAT$4 : image.type,
          n
        );
      }
      function postConvert(image, data) {
        if (image.type === GL_HALF_FLOAT_OES$1) {
          image.data = convertToHalfFloat(data);
          pool.freeType(data);
        } else {
          image.data = data;
        }
      }
      function transposeData(image, array2, strideX, strideY, strideC, offset) {
        var w = image.width;
        var h3 = image.height;
        var c = image.channels;
        var n = w * h3 * c;
        var data = preConvert(image, n);
        var p = 0;
        for (var i = 0; i < h3; ++i) {
          for (var j = 0; j < w; ++j) {
            for (var k = 0; k < c; ++k) {
              data[p++] = array2[strideX * j + strideY * i + strideC * k + offset];
            }
          }
        }
        postConvert(image, data);
      }
      function getTextureSize(format2, type2, width, height, isMipmap, isCube) {
        var s;
        if (typeof FORMAT_SIZES_SPECIAL[format2] !== "undefined") {
          s = FORMAT_SIZES_SPECIAL[format2];
        } else {
          s = FORMAT_CHANNELS[format2] * TYPE_SIZES[type2];
        }
        if (isCube) {
          s *= 6;
        }
        if (isMipmap) {
          var total = 0;
          var w = width;
          while (w >= 1) {
            total += s * w * w;
            w /= 2;
          }
          return total;
        } else {
          return s * width * height;
        }
      }
      function createTextureSet(gl, extensions, limits, reglPoll, contextState, stats2, config) {
        var mipmapHint = {
          "don't care": GL_DONT_CARE,
          "dont care": GL_DONT_CARE,
          "nice": GL_NICEST,
          "fast": GL_FASTEST
        };
        var wrapModes = {
          "repeat": GL_REPEAT,
          "clamp": GL_CLAMP_TO_EDGE$1,
          "mirror": GL_MIRRORED_REPEAT
        };
        var magFilters = {
          "nearest": GL_NEAREST$1,
          "linear": GL_LINEAR
        };
        var minFilters = extend2({
          "mipmap": GL_LINEAR_MIPMAP_LINEAR$1,
          "nearest mipmap nearest": GL_NEAREST_MIPMAP_NEAREST$1,
          "linear mipmap nearest": GL_LINEAR_MIPMAP_NEAREST$1,
          "nearest mipmap linear": GL_NEAREST_MIPMAP_LINEAR$1,
          "linear mipmap linear": GL_LINEAR_MIPMAP_LINEAR$1
        }, magFilters);
        var colorSpace = {
          "none": 0,
          "browser": GL_BROWSER_DEFAULT_WEBGL
        };
        var textureTypes = {
          "uint8": GL_UNSIGNED_BYTE$5,
          "rgba4": GL_UNSIGNED_SHORT_4_4_4_4$1,
          "rgb565": GL_UNSIGNED_SHORT_5_6_5$1,
          "rgb5 a1": GL_UNSIGNED_SHORT_5_5_5_1$1
        };
        var textureFormats = {
          "alpha": GL_ALPHA,
          "luminance": GL_LUMINANCE,
          "luminance alpha": GL_LUMINANCE_ALPHA,
          "rgb": GL_RGB,
          "rgba": GL_RGBA$1,
          "rgba4": GL_RGBA4,
          "rgb5 a1": GL_RGB5_A1,
          "rgb565": GL_RGB565
        };
        var compressedTextureFormats = {};
        if (extensions.ext_srgb) {
          textureFormats.srgb = GL_SRGB_EXT;
          textureFormats.srgba = GL_SRGB_ALPHA_EXT;
        }
        if (extensions.oes_texture_float) {
          textureTypes.float32 = textureTypes.float = GL_FLOAT$4;
        }
        if (extensions.oes_texture_half_float) {
          textureTypes["float16"] = textureTypes["half float"] = GL_HALF_FLOAT_OES$1;
        }
        if (extensions.webgl_depth_texture) {
          extend2(textureFormats, {
            "depth": GL_DEPTH_COMPONENT,
            "depth stencil": GL_DEPTH_STENCIL
          });
          extend2(textureTypes, {
            "uint16": GL_UNSIGNED_SHORT$3,
            "uint32": GL_UNSIGNED_INT$3,
            "depth stencil": GL_UNSIGNED_INT_24_8_WEBGL$1
          });
        }
        if (extensions.webgl_compressed_texture_s3tc) {
          extend2(compressedTextureFormats, {
            "rgb s3tc dxt1": GL_COMPRESSED_RGB_S3TC_DXT1_EXT,
            "rgba s3tc dxt1": GL_COMPRESSED_RGBA_S3TC_DXT1_EXT,
            "rgba s3tc dxt3": GL_COMPRESSED_RGBA_S3TC_DXT3_EXT,
            "rgba s3tc dxt5": GL_COMPRESSED_RGBA_S3TC_DXT5_EXT
          });
        }
        if (extensions.webgl_compressed_texture_atc) {
          extend2(compressedTextureFormats, {
            "rgb atc": GL_COMPRESSED_RGB_ATC_WEBGL,
            "rgba atc explicit alpha": GL_COMPRESSED_RGBA_ATC_EXPLICIT_ALPHA_WEBGL,
            "rgba atc interpolated alpha": GL_COMPRESSED_RGBA_ATC_INTERPOLATED_ALPHA_WEBGL
          });
        }
        if (extensions.webgl_compressed_texture_pvrtc) {
          extend2(compressedTextureFormats, {
            "rgb pvrtc 4bppv1": GL_COMPRESSED_RGB_PVRTC_4BPPV1_IMG,
            "rgb pvrtc 2bppv1": GL_COMPRESSED_RGB_PVRTC_2BPPV1_IMG,
            "rgba pvrtc 4bppv1": GL_COMPRESSED_RGBA_PVRTC_4BPPV1_IMG,
            "rgba pvrtc 2bppv1": GL_COMPRESSED_RGBA_PVRTC_2BPPV1_IMG
          });
        }
        if (extensions.webgl_compressed_texture_etc1) {
          compressedTextureFormats["rgb etc1"] = GL_COMPRESSED_RGB_ETC1_WEBGL;
        }
        var supportedCompressedFormats = Array.prototype.slice.call(
          gl.getParameter(GL_COMPRESSED_TEXTURE_FORMATS)
        );
        Object.keys(compressedTextureFormats).forEach(function(name) {
          var format2 = compressedTextureFormats[name];
          if (supportedCompressedFormats.indexOf(format2) >= 0) {
            textureFormats[name] = format2;
          }
        });
        var supportedFormats = Object.keys(textureFormats);
        limits.textureFormats = supportedFormats;
        var textureFormatsInvert = [];
        Object.keys(textureFormats).forEach(function(key) {
          var val = textureFormats[key];
          textureFormatsInvert[val] = key;
        });
        var textureTypesInvert = [];
        Object.keys(textureTypes).forEach(function(key) {
          var val = textureTypes[key];
          textureTypesInvert[val] = key;
        });
        var magFiltersInvert = [];
        Object.keys(magFilters).forEach(function(key) {
          var val = magFilters[key];
          magFiltersInvert[val] = key;
        });
        var minFiltersInvert = [];
        Object.keys(minFilters).forEach(function(key) {
          var val = minFilters[key];
          minFiltersInvert[val] = key;
        });
        var wrapModesInvert = [];
        Object.keys(wrapModes).forEach(function(key) {
          var val = wrapModes[key];
          wrapModesInvert[val] = key;
        });
        var colorFormats = supportedFormats.reduce(function(color2, key) {
          var glenum = textureFormats[key];
          if (glenum === GL_LUMINANCE || glenum === GL_ALPHA || glenum === GL_LUMINANCE || glenum === GL_LUMINANCE_ALPHA || glenum === GL_DEPTH_COMPONENT || glenum === GL_DEPTH_STENCIL || extensions.ext_srgb && (glenum === GL_SRGB_EXT || glenum === GL_SRGB_ALPHA_EXT)) {
            color2[glenum] = glenum;
          } else if (glenum === GL_RGB5_A1 || key.indexOf("rgba") >= 0) {
            color2[glenum] = GL_RGBA$1;
          } else {
            color2[glenum] = GL_RGB;
          }
          return color2;
        }, {});
        function TexFlags() {
          this.internalformat = GL_RGBA$1;
          this.format = GL_RGBA$1;
          this.type = GL_UNSIGNED_BYTE$5;
          this.compressed = false;
          this.premultiplyAlpha = false;
          this.flipY = false;
          this.unpackAlignment = 1;
          this.colorSpace = GL_BROWSER_DEFAULT_WEBGL;
          this.width = 0;
          this.height = 0;
          this.channels = 0;
        }
        function copyFlags(result, other) {
          result.internalformat = other.internalformat;
          result.format = other.format;
          result.type = other.type;
          result.compressed = other.compressed;
          result.premultiplyAlpha = other.premultiplyAlpha;
          result.flipY = other.flipY;
          result.unpackAlignment = other.unpackAlignment;
          result.colorSpace = other.colorSpace;
          result.width = other.width;
          result.height = other.height;
          result.channels = other.channels;
        }
        function parseFlags(flags, options) {
          if (typeof options !== "object" || !options) {
            return;
          }
          if ("premultiplyAlpha" in options) {
            check$1.type(
              options.premultiplyAlpha,
              "boolean",
              "invalid premultiplyAlpha"
            );
            flags.premultiplyAlpha = options.premultiplyAlpha;
          }
          if ("flipY" in options) {
            check$1.type(
              options.flipY,
              "boolean",
              "invalid texture flip"
            );
            flags.flipY = options.flipY;
          }
          if ("alignment" in options) {
            check$1.oneOf(
              options.alignment,
              [1, 2, 4, 8],
              "invalid texture unpack alignment"
            );
            flags.unpackAlignment = options.alignment;
          }
          if ("colorSpace" in options) {
            check$1.parameter(
              options.colorSpace,
              colorSpace,
              "invalid colorSpace"
            );
            flags.colorSpace = colorSpace[options.colorSpace];
          }
          if ("type" in options) {
            var type2 = options.type;
            check$1(
              extensions.oes_texture_float || !(type2 === "float" || type2 === "float32"),
              "you must enable the OES_texture_float extension in order to use floating point textures."
            );
            check$1(
              extensions.oes_texture_half_float || !(type2 === "half float" || type2 === "float16"),
              "you must enable the OES_texture_half_float extension in order to use 16-bit floating point textures."
            );
            check$1(
              extensions.webgl_depth_texture || !(type2 === "uint16" || type2 === "uint32" || type2 === "depth stencil"),
              "you must enable the WEBGL_depth_texture extension in order to use depth/stencil textures."
            );
            check$1.parameter(
              type2,
              textureTypes,
              "invalid texture type"
            );
            flags.type = textureTypes[type2];
          }
          var w = flags.width;
          var h3 = flags.height;
          var c = flags.channels;
          var hasChannels = false;
          if ("shape" in options) {
            check$1(
              Array.isArray(options.shape) && options.shape.length >= 2,
              "shape must be an array"
            );
            w = options.shape[0];
            h3 = options.shape[1];
            if (options.shape.length === 3) {
              c = options.shape[2];
              check$1(c > 0 && c <= 4, "invalid number of channels");
              hasChannels = true;
            }
            check$1(w >= 0 && w <= limits.maxTextureSize, "invalid width");
            check$1(h3 >= 0 && h3 <= limits.maxTextureSize, "invalid height");
          } else {
            if ("radius" in options) {
              w = h3 = options.radius;
              check$1(w >= 0 && w <= limits.maxTextureSize, "invalid radius");
            }
            if ("width" in options) {
              w = options.width;
              check$1(w >= 0 && w <= limits.maxTextureSize, "invalid width");
            }
            if ("height" in options) {
              h3 = options.height;
              check$1(h3 >= 0 && h3 <= limits.maxTextureSize, "invalid height");
            }
            if ("channels" in options) {
              c = options.channels;
              check$1(c > 0 && c <= 4, "invalid number of channels");
              hasChannels = true;
            }
          }
          flags.width = w | 0;
          flags.height = h3 | 0;
          flags.channels = c | 0;
          var hasFormat = false;
          if ("format" in options) {
            var formatStr = options.format;
            check$1(
              extensions.webgl_depth_texture || !(formatStr === "depth" || formatStr === "depth stencil"),
              "you must enable the WEBGL_depth_texture extension in order to use depth/stencil textures."
            );
            check$1.parameter(
              formatStr,
              textureFormats,
              "invalid texture format"
            );
            var internalformat = flags.internalformat = textureFormats[formatStr];
            flags.format = colorFormats[internalformat];
            if (formatStr in textureTypes) {
              if (!("type" in options)) {
                flags.type = textureTypes[formatStr];
              }
            }
            if (formatStr in compressedTextureFormats) {
              flags.compressed = true;
            }
            hasFormat = true;
          }
          if (!hasChannels && hasFormat) {
            flags.channels = FORMAT_CHANNELS[flags.format];
          } else if (hasChannels && !hasFormat) {
            if (flags.channels !== CHANNELS_FORMAT[flags.format]) {
              flags.format = flags.internalformat = CHANNELS_FORMAT[flags.channels];
            }
          } else if (hasFormat && hasChannels) {
            check$1(
              flags.channels === FORMAT_CHANNELS[flags.format],
              "number of channels inconsistent with specified format"
            );
          }
        }
        function setFlags(flags) {
          gl.pixelStorei(GL_UNPACK_FLIP_Y_WEBGL, flags.flipY);
          gl.pixelStorei(GL_UNPACK_PREMULTIPLY_ALPHA_WEBGL, flags.premultiplyAlpha);
          gl.pixelStorei(GL_UNPACK_COLORSPACE_CONVERSION_WEBGL, flags.colorSpace);
          gl.pixelStorei(GL_UNPACK_ALIGNMENT, flags.unpackAlignment);
        }
        function TexImage() {
          TexFlags.call(this);
          this.xOffset = 0;
          this.yOffset = 0;
          this.data = null;
          this.needsFree = false;
          this.element = null;
          this.needsCopy = false;
        }
        function parseImage(image, options) {
          var data = null;
          if (isPixelData(options)) {
            data = options;
          } else if (options) {
            check$1.type(options, "object", "invalid pixel data type");
            parseFlags(image, options);
            if ("x" in options) {
              image.xOffset = options.x | 0;
            }
            if ("y" in options) {
              image.yOffset = options.y | 0;
            }
            if (isPixelData(options.data)) {
              data = options.data;
            }
          }
          check$1(
            !image.compressed || data instanceof Uint8Array,
            "compressed texture data must be stored in a uint8array"
          );
          if (options.copy) {
            check$1(!data, "can not specify copy and data field for the same texture");
            var viewW = contextState.viewportWidth;
            var viewH = contextState.viewportHeight;
            image.width = image.width || viewW - image.xOffset;
            image.height = image.height || viewH - image.yOffset;
            image.needsCopy = true;
            check$1(
              image.xOffset >= 0 && image.xOffset < viewW && image.yOffset >= 0 && image.yOffset < viewH && image.width > 0 && image.width <= viewW && image.height > 0 && image.height <= viewH,
              "copy texture read out of bounds"
            );
          } else if (!data) {
            image.width = image.width || 1;
            image.height = image.height || 1;
            image.channels = image.channels || 4;
          } else if (isTypedArray(data)) {
            image.channels = image.channels || 4;
            image.data = data;
            if (!("type" in options) && image.type === GL_UNSIGNED_BYTE$5) {
              image.type = typedArrayCode$1(data);
            }
          } else if (isNumericArray(data)) {
            image.channels = image.channels || 4;
            convertData(image, data);
            image.alignment = 1;
            image.needsFree = true;
          } else if (isNDArrayLike(data)) {
            var array2 = data.data;
            if (!Array.isArray(array2) && image.type === GL_UNSIGNED_BYTE$5) {
              image.type = typedArrayCode$1(array2);
            }
            var shape = data.shape;
            var stride = data.stride;
            var shapeX, shapeY, shapeC, strideX, strideY, strideC;
            if (shape.length === 3) {
              shapeC = shape[2];
              strideC = stride[2];
            } else {
              check$1(shape.length === 2, "invalid ndarray pixel data, must be 2 or 3D");
              shapeC = 1;
              strideC = 1;
            }
            shapeX = shape[0];
            shapeY = shape[1];
            strideX = stride[0];
            strideY = stride[1];
            image.alignment = 1;
            image.width = shapeX;
            image.height = shapeY;
            image.channels = shapeC;
            image.format = image.internalformat = CHANNELS_FORMAT[shapeC];
            image.needsFree = true;
            transposeData(image, array2, strideX, strideY, strideC, data.offset);
          } else if (isCanvasElement(data) || isOffscreenCanvas(data) || isContext2D(data)) {
            if (isCanvasElement(data) || isOffscreenCanvas(data)) {
              image.element = data;
            } else {
              image.element = data.canvas;
            }
            image.width = image.element.width;
            image.height = image.element.height;
            image.channels = 4;
          } else if (isBitmap(data)) {
            image.element = data;
            image.width = data.width;
            image.height = data.height;
            image.channels = 4;
          } else if (isImageElement(data)) {
            image.element = data;
            image.width = data.naturalWidth;
            image.height = data.naturalHeight;
            image.channels = 4;
          } else if (isVideoElement(data)) {
            image.element = data;
            image.width = data.videoWidth;
            image.height = data.videoHeight;
            image.channels = 4;
          } else if (isRectArray(data)) {
            var w = image.width || data[0].length;
            var h3 = image.height || data.length;
            var c = image.channels;
            if (isArrayLike(data[0][0])) {
              c = c || data[0][0].length;
            } else {
              c = c || 1;
            }
            var arrayShape2 = flattenUtils.shape(data);
            var n = 1;
            for (var dd = 0; dd < arrayShape2.length; ++dd) {
              n *= arrayShape2[dd];
            }
            var allocData = preConvert(image, n);
            flattenUtils.flatten(data, arrayShape2, "", allocData);
            postConvert(image, allocData);
            image.alignment = 1;
            image.width = w;
            image.height = h3;
            image.channels = c;
            image.format = image.internalformat = CHANNELS_FORMAT[c];
            image.needsFree = true;
          }
          if (image.type === GL_FLOAT$4) {
            check$1(
              limits.extensions.indexOf("oes_texture_float") >= 0,
              "oes_texture_float extension not enabled"
            );
          } else if (image.type === GL_HALF_FLOAT_OES$1) {
            check$1(
              limits.extensions.indexOf("oes_texture_half_float") >= 0,
              "oes_texture_half_float extension not enabled"
            );
          }
        }
        function setImage(info, target, miplevel) {
          var element = info.element;
          var data = info.data;
          var internalformat = info.internalformat;
          var format2 = info.format;
          var type2 = info.type;
          var width = info.width;
          var height = info.height;
          setFlags(info);
          if (element) {
            gl.texImage2D(target, miplevel, format2, format2, type2, element);
          } else if (info.compressed) {
            gl.compressedTexImage2D(target, miplevel, internalformat, width, height, 0, data);
          } else if (info.needsCopy) {
            reglPoll();
            gl.copyTexImage2D(
              target,
              miplevel,
              format2,
              info.xOffset,
              info.yOffset,
              width,
              height,
              0
            );
          } else {
            gl.texImage2D(target, miplevel, format2, width, height, 0, format2, type2, data || null);
          }
        }
        function setSubImage(info, target, x2, y2, miplevel) {
          var element = info.element;
          var data = info.data;
          var internalformat = info.internalformat;
          var format2 = info.format;
          var type2 = info.type;
          var width = info.width;
          var height = info.height;
          setFlags(info);
          if (element) {
            gl.texSubImage2D(
              target,
              miplevel,
              x2,
              y2,
              format2,
              type2,
              element
            );
          } else if (info.compressed) {
            gl.compressedTexSubImage2D(
              target,
              miplevel,
              x2,
              y2,
              internalformat,
              width,
              height,
              data
            );
          } else if (info.needsCopy) {
            reglPoll();
            gl.copyTexSubImage2D(
              target,
              miplevel,
              x2,
              y2,
              info.xOffset,
              info.yOffset,
              width,
              height
            );
          } else {
            gl.texSubImage2D(
              target,
              miplevel,
              x2,
              y2,
              width,
              height,
              format2,
              type2,
              data
            );
          }
        }
        var imagePool = [];
        function allocImage() {
          return imagePool.pop() || new TexImage();
        }
        function freeImage(image) {
          if (image.needsFree) {
            pool.freeType(image.data);
          }
          TexImage.call(image);
          imagePool.push(image);
        }
        function MipMap() {
          TexFlags.call(this);
          this.genMipmaps = false;
          this.mipmapHint = GL_DONT_CARE;
          this.mipmask = 0;
          this.images = Array(16);
        }
        function parseMipMapFromShape(mipmap, width, height) {
          var img = mipmap.images[0] = allocImage();
          mipmap.mipmask = 1;
          img.width = mipmap.width = width;
          img.height = mipmap.height = height;
          img.channels = mipmap.channels = 4;
        }
        function parseMipMapFromObject(mipmap, options) {
          var imgData = null;
          if (isPixelData(options)) {
            imgData = mipmap.images[0] = allocImage();
            copyFlags(imgData, mipmap);
            parseImage(imgData, options);
            mipmap.mipmask = 1;
          } else {
            parseFlags(mipmap, options);
            if (Array.isArray(options.mipmap)) {
              var mipData = options.mipmap;
              for (var i = 0; i < mipData.length; ++i) {
                imgData = mipmap.images[i] = allocImage();
                copyFlags(imgData, mipmap);
                imgData.width >>= i;
                imgData.height >>= i;
                parseImage(imgData, mipData[i]);
                mipmap.mipmask |= 1 << i;
              }
            } else {
              imgData = mipmap.images[0] = allocImage();
              copyFlags(imgData, mipmap);
              parseImage(imgData, options);
              mipmap.mipmask = 1;
            }
          }
          copyFlags(mipmap, mipmap.images[0]);
          if (mipmap.compressed && (mipmap.internalformat === GL_COMPRESSED_RGB_S3TC_DXT1_EXT || mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT1_EXT || mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT3_EXT || mipmap.internalformat === GL_COMPRESSED_RGBA_S3TC_DXT5_EXT)) {
            check$1(
              mipmap.width % 4 === 0 && mipmap.height % 4 === 0,
              "for compressed texture formats, mipmap level 0 must have width and height that are a multiple of 4"
            );
          }
        }
        function setMipMap(mipmap, target) {
          var images = mipmap.images;
          for (var i = 0; i < images.length; ++i) {
            if (!images[i]) {
              return;
            }
            setImage(images[i], target, i);
          }
        }
        var mipPool = [];
        function allocMipMap() {
          var result = mipPool.pop() || new MipMap();
          TexFlags.call(result);
          result.mipmask = 0;
          for (var i = 0; i < 16; ++i) {
            result.images[i] = null;
          }
          return result;
        }
        function freeMipMap(mipmap) {
          var images = mipmap.images;
          for (var i = 0; i < images.length; ++i) {
            if (images[i]) {
              freeImage(images[i]);
            }
            images[i] = null;
          }
          mipPool.push(mipmap);
        }
        function TexInfo() {
          this.minFilter = GL_NEAREST$1;
          this.magFilter = GL_NEAREST$1;
          this.wrapS = GL_CLAMP_TO_EDGE$1;
          this.wrapT = GL_CLAMP_TO_EDGE$1;
          this.anisotropic = 1;
          this.genMipmaps = false;
          this.mipmapHint = GL_DONT_CARE;
        }
        function parseTexInfo(info, options) {
          if ("min" in options) {
            var minFilter = options.min;
            check$1.parameter(minFilter, minFilters);
            info.minFilter = minFilters[minFilter];
            if (MIPMAP_FILTERS.indexOf(info.minFilter) >= 0 && !("faces" in options)) {
              info.genMipmaps = true;
            }
          }
          if ("mag" in options) {
            var magFilter = options.mag;
            check$1.parameter(magFilter, magFilters);
            info.magFilter = magFilters[magFilter];
          }
          var wrapS = info.wrapS;
          var wrapT = info.wrapT;
          if ("wrap" in options) {
            var wrap = options.wrap;
            if (typeof wrap === "string") {
              check$1.parameter(wrap, wrapModes);
              wrapS = wrapT = wrapModes[wrap];
            } else if (Array.isArray(wrap)) {
              check$1.parameter(wrap[0], wrapModes);
              check$1.parameter(wrap[1], wrapModes);
              wrapS = wrapModes[wrap[0]];
              wrapT = wrapModes[wrap[1]];
            }
          } else {
            if ("wrapS" in options) {
              var optWrapS = options.wrapS;
              check$1.parameter(optWrapS, wrapModes);
              wrapS = wrapModes[optWrapS];
            }
            if ("wrapT" in options) {
              var optWrapT = options.wrapT;
              check$1.parameter(optWrapT, wrapModes);
              wrapT = wrapModes[optWrapT];
            }
          }
          info.wrapS = wrapS;
          info.wrapT = wrapT;
          if ("anisotropic" in options) {
            var anisotropic = options.anisotropic;
            check$1(
              typeof anisotropic === "number" && anisotropic >= 1 && anisotropic <= limits.maxAnisotropic,
              "aniso samples must be between 1 and "
            );
            info.anisotropic = options.anisotropic;
          }
          if ("mipmap" in options) {
            var hasMipMap = false;
            switch (typeof options.mipmap) {
              case "string":
                check$1.parameter(
                  options.mipmap,
                  mipmapHint,
                  "invalid mipmap hint"
                );
                info.mipmapHint = mipmapHint[options.mipmap];
                info.genMipmaps = true;
                hasMipMap = true;
                break;
              case "boolean":
                hasMipMap = info.genMipmaps = options.mipmap;
                break;
              case "object":
                check$1(Array.isArray(options.mipmap), "invalid mipmap type");
                info.genMipmaps = false;
                hasMipMap = true;
                break;
              default:
                check$1.raise("invalid mipmap type");
            }
            if (hasMipMap && !("min" in options)) {
              info.minFilter = GL_NEAREST_MIPMAP_NEAREST$1;
            }
          }
        }
        function setTexInfo(info, target) {
          gl.texParameteri(target, GL_TEXTURE_MIN_FILTER, info.minFilter);
          gl.texParameteri(target, GL_TEXTURE_MAG_FILTER, info.magFilter);
          gl.texParameteri(target, GL_TEXTURE_WRAP_S, info.wrapS);
          gl.texParameteri(target, GL_TEXTURE_WRAP_T, info.wrapT);
          if (extensions.ext_texture_filter_anisotropic) {
            gl.texParameteri(target, GL_TEXTURE_MAX_ANISOTROPY_EXT, info.anisotropic);
          }
          if (info.genMipmaps) {
            gl.hint(GL_GENERATE_MIPMAP_HINT, info.mipmapHint);
            gl.generateMipmap(target);
          }
        }
        var textureCount = 0;
        var textureSet = {};
        var numTexUnits = limits.maxTextureUnits;
        var textureUnits = Array(numTexUnits).map(function() {
          return null;
        });
        function REGLTexture(target) {
          TexFlags.call(this);
          this.mipmask = 0;
          this.internalformat = GL_RGBA$1;
          this.id = textureCount++;
          this.refCount = 1;
          this.target = target;
          this.texture = gl.createTexture();
          this.unit = -1;
          this.bindCount = 0;
          this.texInfo = new TexInfo();
          if (config.profile) {
            this.stats = { size: 0 };
          }
        }
        function tempBind(texture) {
          gl.activeTexture(GL_TEXTURE0$1);
          gl.bindTexture(texture.target, texture.texture);
        }
        function tempRestore() {
          var prev = textureUnits[0];
          if (prev) {
            gl.bindTexture(prev.target, prev.texture);
          } else {
            gl.bindTexture(GL_TEXTURE_2D$1, null);
          }
        }
        function destroy(texture) {
          var handle = texture.texture;
          check$1(handle, "must not double destroy texture");
          var unit2 = texture.unit;
          var target = texture.target;
          if (unit2 >= 0) {
            gl.activeTexture(GL_TEXTURE0$1 + unit2);
            gl.bindTexture(target, null);
            textureUnits[unit2] = null;
          }
          gl.deleteTexture(handle);
          texture.texture = null;
          texture.params = null;
          texture.pixels = null;
          texture.refCount = 0;
          delete textureSet[texture.id];
          stats2.textureCount--;
        }
        extend2(REGLTexture.prototype, {
          bind: function() {
            var texture = this;
            texture.bindCount += 1;
            var unit2 = texture.unit;
            if (unit2 < 0) {
              for (var i = 0; i < numTexUnits; ++i) {
                var other = textureUnits[i];
                if (other) {
                  if (other.bindCount > 0) {
                    continue;
                  }
                  other.unit = -1;
                }
                textureUnits[i] = texture;
                unit2 = i;
                break;
              }
              if (unit2 >= numTexUnits) {
                check$1.raise("insufficient number of texture units");
              }
              if (config.profile && stats2.maxTextureUnits < unit2 + 1) {
                stats2.maxTextureUnits = unit2 + 1;
              }
              texture.unit = unit2;
              gl.activeTexture(GL_TEXTURE0$1 + unit2);
              gl.bindTexture(texture.target, texture.texture);
            }
            return unit2;
          },
          unbind: function() {
            this.bindCount -= 1;
          },
          decRef: function() {
            if (--this.refCount <= 0) {
              destroy(this);
            }
          }
        });
        function createTexture2D(a, b) {
          var texture = new REGLTexture(GL_TEXTURE_2D$1);
          textureSet[texture.id] = texture;
          stats2.textureCount++;
          function reglTexture2D(a2, b2) {
            var texInfo = texture.texInfo;
            TexInfo.call(texInfo);
            var mipData = allocMipMap();
            if (typeof a2 === "number") {
              if (typeof b2 === "number") {
                parseMipMapFromShape(mipData, a2 | 0, b2 | 0);
              } else {
                parseMipMapFromShape(mipData, a2 | 0, a2 | 0);
              }
            } else if (a2) {
              check$1.type(a2, "object", "invalid arguments to regl.texture");
              parseTexInfo(texInfo, a2);
              parseMipMapFromObject(mipData, a2);
            } else {
              parseMipMapFromShape(mipData, 1, 1);
            }
            if (texInfo.genMipmaps) {
              mipData.mipmask = (mipData.width << 1) - 1;
            }
            texture.mipmask = mipData.mipmask;
            copyFlags(texture, mipData);
            check$1.texture2D(texInfo, mipData, limits);
            texture.internalformat = mipData.internalformat;
            reglTexture2D.width = mipData.width;
            reglTexture2D.height = mipData.height;
            tempBind(texture);
            setMipMap(mipData, GL_TEXTURE_2D$1);
            setTexInfo(texInfo, GL_TEXTURE_2D$1);
            tempRestore();
            freeMipMap(mipData);
            if (config.profile) {
              texture.stats.size = getTextureSize(
                texture.internalformat,
                texture.type,
                mipData.width,
                mipData.height,
                texInfo.genMipmaps,
                false
              );
            }
            reglTexture2D.format = textureFormatsInvert[texture.internalformat];
            reglTexture2D.type = textureTypesInvert[texture.type];
            reglTexture2D.mag = magFiltersInvert[texInfo.magFilter];
            reglTexture2D.min = minFiltersInvert[texInfo.minFilter];
            reglTexture2D.wrapS = wrapModesInvert[texInfo.wrapS];
            reglTexture2D.wrapT = wrapModesInvert[texInfo.wrapT];
            return reglTexture2D;
          }
          function subimage(image, x_, y_, level_) {
            check$1(!!image, "must specify image data");
            var x2 = x_ | 0;
            var y2 = y_ | 0;
            var level = level_ | 0;
            var imageData = allocImage();
            copyFlags(imageData, texture);
            imageData.width = 0;
            imageData.height = 0;
            parseImage(imageData, image);
            imageData.width = imageData.width || (texture.width >> level) - x2;
            imageData.height = imageData.height || (texture.height >> level) - y2;
            check$1(
              texture.type === imageData.type && texture.format === imageData.format && texture.internalformat === imageData.internalformat,
              "incompatible format for texture.subimage"
            );
            check$1(
              x2 >= 0 && y2 >= 0 && x2 + imageData.width <= texture.width && y2 + imageData.height <= texture.height,
              "texture.subimage write out of bounds"
            );
            check$1(
              texture.mipmask & 1 << level,
              "missing mipmap data"
            );
            check$1(
              imageData.data || imageData.element || imageData.needsCopy,
              "missing image data"
            );
            tempBind(texture);
            setSubImage(imageData, GL_TEXTURE_2D$1, x2, y2, level);
            tempRestore();
            freeImage(imageData);
            return reglTexture2D;
          }
          function resize(w_, h_) {
            var w = w_ | 0;
            var h3 = h_ | 0 || w;
            if (w === texture.width && h3 === texture.height) {
              return reglTexture2D;
            }
            reglTexture2D.width = texture.width = w;
            reglTexture2D.height = texture.height = h3;
            tempBind(texture);
            for (var i = 0; texture.mipmask >> i; ++i) {
              var _w = w >> i;
              var _h = h3 >> i;
              if (!_w || !_h) break;
              gl.texImage2D(
                GL_TEXTURE_2D$1,
                i,
                texture.format,
                _w,
                _h,
                0,
                texture.format,
                texture.type,
                null
              );
            }
            tempRestore();
            if (config.profile) {
              texture.stats.size = getTextureSize(
                texture.internalformat,
                texture.type,
                w,
                h3,
                false,
                false
              );
            }
            return reglTexture2D;
          }
          reglTexture2D(a, b);
          reglTexture2D.subimage = subimage;
          reglTexture2D.resize = resize;
          reglTexture2D._reglType = "texture2d";
          reglTexture2D._texture = texture;
          if (config.profile) {
            reglTexture2D.stats = texture.stats;
          }
          reglTexture2D.destroy = function() {
            texture.decRef();
          };
          return reglTexture2D;
        }
        function createTextureCube(a0, a1, a2, a3, a4, a5) {
          var texture = new REGLTexture(GL_TEXTURE_CUBE_MAP$1);
          textureSet[texture.id] = texture;
          stats2.cubeCount++;
          var faces = new Array(6);
          function reglTextureCube(a02, a12, a22, a32, a42, a52) {
            var i;
            var texInfo = texture.texInfo;
            TexInfo.call(texInfo);
            for (i = 0; i < 6; ++i) {
              faces[i] = allocMipMap();
            }
            if (typeof a02 === "number" || !a02) {
              var s = a02 | 0 || 1;
              for (i = 0; i < 6; ++i) {
                parseMipMapFromShape(faces[i], s, s);
              }
            } else if (typeof a02 === "object") {
              if (a12) {
                parseMipMapFromObject(faces[0], a02);
                parseMipMapFromObject(faces[1], a12);
                parseMipMapFromObject(faces[2], a22);
                parseMipMapFromObject(faces[3], a32);
                parseMipMapFromObject(faces[4], a42);
                parseMipMapFromObject(faces[5], a52);
              } else {
                parseTexInfo(texInfo, a02);
                parseFlags(texture, a02);
                if ("faces" in a02) {
                  var faceInput = a02.faces;
                  check$1(
                    Array.isArray(faceInput) && faceInput.length === 6,
                    "cube faces must be a length 6 array"
                  );
                  for (i = 0; i < 6; ++i) {
                    check$1(
                      typeof faceInput[i] === "object" && !!faceInput[i],
                      "invalid input for cube map face"
                    );
                    copyFlags(faces[i], texture);
                    parseMipMapFromObject(faces[i], faceInput[i]);
                  }
                } else {
                  for (i = 0; i < 6; ++i) {
                    parseMipMapFromObject(faces[i], a02);
                  }
                }
              }
            } else {
              check$1.raise("invalid arguments to cube map");
            }
            copyFlags(texture, faces[0]);
            check$1.optional(function() {
              if (!limits.npotTextureCube) {
                check$1(isPow2$1(texture.width) && isPow2$1(texture.height), "your browser does not support non power or two texture dimensions");
              }
            });
            if (texInfo.genMipmaps) {
              texture.mipmask = (faces[0].width << 1) - 1;
            } else {
              texture.mipmask = faces[0].mipmask;
            }
            check$1.textureCube(texture, texInfo, faces, limits);
            texture.internalformat = faces[0].internalformat;
            reglTextureCube.width = faces[0].width;
            reglTextureCube.height = faces[0].height;
            tempBind(texture);
            for (i = 0; i < 6; ++i) {
              setMipMap(faces[i], GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + i);
            }
            setTexInfo(texInfo, GL_TEXTURE_CUBE_MAP$1);
            tempRestore();
            if (config.profile) {
              texture.stats.size = getTextureSize(
                texture.internalformat,
                texture.type,
                reglTextureCube.width,
                reglTextureCube.height,
                texInfo.genMipmaps,
                true
              );
            }
            reglTextureCube.format = textureFormatsInvert[texture.internalformat];
            reglTextureCube.type = textureTypesInvert[texture.type];
            reglTextureCube.mag = magFiltersInvert[texInfo.magFilter];
            reglTextureCube.min = minFiltersInvert[texInfo.minFilter];
            reglTextureCube.wrapS = wrapModesInvert[texInfo.wrapS];
            reglTextureCube.wrapT = wrapModesInvert[texInfo.wrapT];
            for (i = 0; i < 6; ++i) {
              freeMipMap(faces[i]);
            }
            return reglTextureCube;
          }
          function subimage(face, image, x_, y_, level_) {
            check$1(!!image, "must specify image data");
            check$1(typeof face === "number" && face === (face | 0) && face >= 0 && face < 6, "invalid face");
            var x2 = x_ | 0;
            var y2 = y_ | 0;
            var level = level_ | 0;
            var imageData = allocImage();
            copyFlags(imageData, texture);
            imageData.width = 0;
            imageData.height = 0;
            parseImage(imageData, image);
            imageData.width = imageData.width || (texture.width >> level) - x2;
            imageData.height = imageData.height || (texture.height >> level) - y2;
            check$1(
              texture.type === imageData.type && texture.format === imageData.format && texture.internalformat === imageData.internalformat,
              "incompatible format for texture.subimage"
            );
            check$1(
              x2 >= 0 && y2 >= 0 && x2 + imageData.width <= texture.width && y2 + imageData.height <= texture.height,
              "texture.subimage write out of bounds"
            );
            check$1(
              texture.mipmask & 1 << level,
              "missing mipmap data"
            );
            check$1(
              imageData.data || imageData.element || imageData.needsCopy,
              "missing image data"
            );
            tempBind(texture);
            setSubImage(imageData, GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + face, x2, y2, level);
            tempRestore();
            freeImage(imageData);
            return reglTextureCube;
          }
          function resize(radius_) {
            var radius = radius_ | 0;
            if (radius === texture.width) {
              return;
            }
            reglTextureCube.width = texture.width = radius;
            reglTextureCube.height = texture.height = radius;
            tempBind(texture);
            for (var i = 0; i < 6; ++i) {
              for (var j = 0; texture.mipmask >> j; ++j) {
                gl.texImage2D(
                  GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + i,
                  j,
                  texture.format,
                  radius >> j,
                  radius >> j,
                  0,
                  texture.format,
                  texture.type,
                  null
                );
              }
            }
            tempRestore();
            if (config.profile) {
              texture.stats.size = getTextureSize(
                texture.internalformat,
                texture.type,
                reglTextureCube.width,
                reglTextureCube.height,
                false,
                true
              );
            }
            return reglTextureCube;
          }
          reglTextureCube(a0, a1, a2, a3, a4, a5);
          reglTextureCube.subimage = subimage;
          reglTextureCube.resize = resize;
          reglTextureCube._reglType = "textureCube";
          reglTextureCube._texture = texture;
          if (config.profile) {
            reglTextureCube.stats = texture.stats;
          }
          reglTextureCube.destroy = function() {
            texture.decRef();
          };
          return reglTextureCube;
        }
        function destroyTextures() {
          for (var i = 0; i < numTexUnits; ++i) {
            gl.activeTexture(GL_TEXTURE0$1 + i);
            gl.bindTexture(GL_TEXTURE_2D$1, null);
            textureUnits[i] = null;
          }
          values(textureSet).forEach(destroy);
          stats2.cubeCount = 0;
          stats2.textureCount = 0;
        }
        if (config.profile) {
          stats2.getTotalTextureSize = function() {
            var total = 0;
            Object.keys(textureSet).forEach(function(key) {
              total += textureSet[key].stats.size;
            });
            return total;
          };
        }
        function restoreTextures() {
          for (var i = 0; i < numTexUnits; ++i) {
            var tex = textureUnits[i];
            if (tex) {
              tex.bindCount = 0;
              tex.unit = -1;
              textureUnits[i] = null;
            }
          }
          values(textureSet).forEach(function(texture) {
            texture.texture = gl.createTexture();
            gl.bindTexture(texture.target, texture.texture);
            for (var i2 = 0; i2 < 32; ++i2) {
              if ((texture.mipmask & 1 << i2) === 0) {
                continue;
              }
              if (texture.target === GL_TEXTURE_2D$1) {
                gl.texImage2D(
                  GL_TEXTURE_2D$1,
                  i2,
                  texture.internalformat,
                  texture.width >> i2,
                  texture.height >> i2,
                  0,
                  texture.internalformat,
                  texture.type,
                  null
                );
              } else {
                for (var j = 0; j < 6; ++j) {
                  gl.texImage2D(
                    GL_TEXTURE_CUBE_MAP_POSITIVE_X$1 + j,
                    i2,
                    texture.internalformat,
                    texture.width >> i2,
                    texture.height >> i2,
                    0,
                    texture.internalformat,
                    texture.type,
                    null
                  );
                }
              }
            }
            setTexInfo(texture.texInfo, texture.target);
          });
        }
        function refreshTextures() {
          for (var i = 0; i < numTexUnits; ++i) {
            var tex = textureUnits[i];
            if (tex) {
              tex.bindCount = 0;
              tex.unit = -1;
              textureUnits[i] = null;
            }
            gl.activeTexture(GL_TEXTURE0$1 + i);
            gl.bindTexture(GL_TEXTURE_2D$1, null);
            gl.bindTexture(GL_TEXTURE_CUBE_MAP$1, null);
          }
        }
        return {
          create2D: createTexture2D,
          createCube: createTextureCube,
          clear: destroyTextures,
          getTexture: function(wrapper) {
            return null;
          },
          restore: restoreTextures,
          refresh: refreshTextures
        };
      }
      var GL_RENDERBUFFER = 36161;
      var GL_RGBA4$1 = 32854;
      var GL_RGB5_A1$1 = 32855;
      var GL_RGB565$1 = 36194;
      var GL_DEPTH_COMPONENT16 = 33189;
      var GL_STENCIL_INDEX8 = 36168;
      var GL_DEPTH_STENCIL$1 = 34041;
      var GL_SRGB8_ALPHA8_EXT = 35907;
      var GL_RGBA32F_EXT = 34836;
      var GL_RGBA16F_EXT = 34842;
      var GL_RGB16F_EXT = 34843;
      var FORMAT_SIZES = [];
      FORMAT_SIZES[GL_RGBA4$1] = 2;
      FORMAT_SIZES[GL_RGB5_A1$1] = 2;
      FORMAT_SIZES[GL_RGB565$1] = 2;
      FORMAT_SIZES[GL_DEPTH_COMPONENT16] = 2;
      FORMAT_SIZES[GL_STENCIL_INDEX8] = 1;
      FORMAT_SIZES[GL_DEPTH_STENCIL$1] = 4;
      FORMAT_SIZES[GL_SRGB8_ALPHA8_EXT] = 4;
      FORMAT_SIZES[GL_RGBA32F_EXT] = 16;
      FORMAT_SIZES[GL_RGBA16F_EXT] = 8;
      FORMAT_SIZES[GL_RGB16F_EXT] = 6;
      function getRenderbufferSize(format2, width, height) {
        return FORMAT_SIZES[format2] * width * height;
      }
      var wrapRenderbuffers = function(gl, extensions, limits, stats2, config) {
        var formatTypes = {
          "rgba4": GL_RGBA4$1,
          "rgb565": GL_RGB565$1,
          "rgb5 a1": GL_RGB5_A1$1,
          "depth": GL_DEPTH_COMPONENT16,
          "stencil": GL_STENCIL_INDEX8,
          "depth stencil": GL_DEPTH_STENCIL$1
        };
        if (extensions.ext_srgb) {
          formatTypes["srgba"] = GL_SRGB8_ALPHA8_EXT;
        }
        if (extensions.ext_color_buffer_half_float) {
          formatTypes["rgba16f"] = GL_RGBA16F_EXT;
          formatTypes["rgb16f"] = GL_RGB16F_EXT;
        }
        if (extensions.webgl_color_buffer_float) {
          formatTypes["rgba32f"] = GL_RGBA32F_EXT;
        }
        var formatTypesInvert = [];
        Object.keys(formatTypes).forEach(function(key) {
          var val = formatTypes[key];
          formatTypesInvert[val] = key;
        });
        var renderbufferCount = 0;
        var renderbufferSet = {};
        function REGLRenderbuffer(renderbuffer) {
          this.id = renderbufferCount++;
          this.refCount = 1;
          this.renderbuffer = renderbuffer;
          this.format = GL_RGBA4$1;
          this.width = 0;
          this.height = 0;
          if (config.profile) {
            this.stats = { size: 0 };
          }
        }
        REGLRenderbuffer.prototype.decRef = function() {
          if (--this.refCount <= 0) {
            destroy(this);
          }
        };
        function destroy(rb) {
          var handle = rb.renderbuffer;
          check$1(handle, "must not double destroy renderbuffer");
          gl.bindRenderbuffer(GL_RENDERBUFFER, null);
          gl.deleteRenderbuffer(handle);
          rb.renderbuffer = null;
          rb.refCount = 0;
          delete renderbufferSet[rb.id];
          stats2.renderbufferCount--;
        }
        function createRenderbuffer(a, b) {
          var renderbuffer = new REGLRenderbuffer(gl.createRenderbuffer());
          renderbufferSet[renderbuffer.id] = renderbuffer;
          stats2.renderbufferCount++;
          function reglRenderbuffer(a2, b2) {
            var w = 0;
            var h3 = 0;
            var format2 = GL_RGBA4$1;
            if (typeof a2 === "object" && a2) {
              var options = a2;
              if ("shape" in options) {
                var shape = options.shape;
                check$1(
                  Array.isArray(shape) && shape.length >= 2,
                  "invalid renderbuffer shape"
                );
                w = shape[0] | 0;
                h3 = shape[1] | 0;
              } else {
                if ("radius" in options) {
                  w = h3 = options.radius | 0;
                }
                if ("width" in options) {
                  w = options.width | 0;
                }
                if ("height" in options) {
                  h3 = options.height | 0;
                }
              }
              if ("format" in options) {
                check$1.parameter(
                  options.format,
                  formatTypes,
                  "invalid renderbuffer format"
                );
                format2 = formatTypes[options.format];
              }
            } else if (typeof a2 === "number") {
              w = a2 | 0;
              if (typeof b2 === "number") {
                h3 = b2 | 0;
              } else {
                h3 = w;
              }
            } else if (!a2) {
              w = h3 = 1;
            } else {
              check$1.raise("invalid arguments to renderbuffer constructor");
            }
            check$1(
              w > 0 && h3 > 0 && w <= limits.maxRenderbufferSize && h3 <= limits.maxRenderbufferSize,
              "invalid renderbuffer size"
            );
            if (w === renderbuffer.width && h3 === renderbuffer.height && format2 === renderbuffer.format) {
              return;
            }
            reglRenderbuffer.width = renderbuffer.width = w;
            reglRenderbuffer.height = renderbuffer.height = h3;
            renderbuffer.format = format2;
            gl.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer.renderbuffer);
            gl.renderbufferStorage(GL_RENDERBUFFER, format2, w, h3);
            check$1(
              gl.getError() === 0,
              "invalid render buffer format"
            );
            if (config.profile) {
              renderbuffer.stats.size = getRenderbufferSize(renderbuffer.format, renderbuffer.width, renderbuffer.height);
            }
            reglRenderbuffer.format = formatTypesInvert[renderbuffer.format];
            return reglRenderbuffer;
          }
          function resize(w_, h_) {
            var w = w_ | 0;
            var h3 = h_ | 0 || w;
            if (w === renderbuffer.width && h3 === renderbuffer.height) {
              return reglRenderbuffer;
            }
            check$1(
              w > 0 && h3 > 0 && w <= limits.maxRenderbufferSize && h3 <= limits.maxRenderbufferSize,
              "invalid renderbuffer size"
            );
            reglRenderbuffer.width = renderbuffer.width = w;
            reglRenderbuffer.height = renderbuffer.height = h3;
            gl.bindRenderbuffer(GL_RENDERBUFFER, renderbuffer.renderbuffer);
            gl.renderbufferStorage(GL_RENDERBUFFER, renderbuffer.format, w, h3);
            check$1(
              gl.getError() === 0,
              "invalid render buffer format"
            );
            if (config.profile) {
              renderbuffer.stats.size = getRenderbufferSize(
                renderbuffer.format,
                renderbuffer.width,
                renderbuffer.height
              );
            }
            return reglRenderbuffer;
          }
          reglRenderbuffer(a, b);
          reglRenderbuffer.resize = resize;
          reglRenderbuffer._reglType = "renderbuffer";
          reglRenderbuffer._renderbuffer = renderbuffer;
          if (config.profile) {
            reglRenderbuffer.stats = renderbuffer.stats;
          }
          reglRenderbuffer.destroy = function() {
            renderbuffer.decRef();
          };
          return reglRenderbuffer;
        }
        if (config.profile) {
          stats2.getTotalRenderbufferSize = function() {
            var total = 0;
            Object.keys(renderbufferSet).forEach(function(key) {
              total += renderbufferSet[key].stats.size;
            });
            return total;
          };
        }
        function restoreRenderbuffers() {
          values(renderbufferSet).forEach(function(rb) {
            rb.renderbuffer = gl.createRenderbuffer();
            gl.bindRenderbuffer(GL_RENDERBUFFER, rb.renderbuffer);
            gl.renderbufferStorage(GL_RENDERBUFFER, rb.format, rb.width, rb.height);
          });
          gl.bindRenderbuffer(GL_RENDERBUFFER, null);
        }
        return {
          create: createRenderbuffer,
          clear: function() {
            values(renderbufferSet).forEach(destroy);
          },
          restore: restoreRenderbuffers
        };
      };
      var GL_FRAMEBUFFER$1 = 36160;
      var GL_RENDERBUFFER$1 = 36161;
      var GL_TEXTURE_2D$2 = 3553;
      var GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 = 34069;
      var GL_COLOR_ATTACHMENT0$1 = 36064;
      var GL_DEPTH_ATTACHMENT = 36096;
      var GL_STENCIL_ATTACHMENT = 36128;
      var GL_DEPTH_STENCIL_ATTACHMENT = 33306;
      var GL_FRAMEBUFFER_COMPLETE$1 = 36053;
      var GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT = 36054;
      var GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT = 36055;
      var GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS = 36057;
      var GL_FRAMEBUFFER_UNSUPPORTED = 36061;
      var GL_HALF_FLOAT_OES$2 = 36193;
      var GL_UNSIGNED_BYTE$6 = 5121;
      var GL_FLOAT$5 = 5126;
      var GL_RGB$1 = 6407;
      var GL_RGBA$2 = 6408;
      var GL_DEPTH_COMPONENT$1 = 6402;
      var colorTextureFormatEnums = [
        GL_RGB$1,
        GL_RGBA$2
      ];
      var textureFormatChannels = [];
      textureFormatChannels[GL_RGBA$2] = 4;
      textureFormatChannels[GL_RGB$1] = 3;
      var textureTypeSizes = [];
      textureTypeSizes[GL_UNSIGNED_BYTE$6] = 1;
      textureTypeSizes[GL_FLOAT$5] = 4;
      textureTypeSizes[GL_HALF_FLOAT_OES$2] = 2;
      var GL_RGBA4$2 = 32854;
      var GL_RGB5_A1$2 = 32855;
      var GL_RGB565$2 = 36194;
      var GL_DEPTH_COMPONENT16$1 = 33189;
      var GL_STENCIL_INDEX8$1 = 36168;
      var GL_DEPTH_STENCIL$2 = 34041;
      var GL_SRGB8_ALPHA8_EXT$1 = 35907;
      var GL_RGBA32F_EXT$1 = 34836;
      var GL_RGBA16F_EXT$1 = 34842;
      var GL_RGB16F_EXT$1 = 34843;
      var colorRenderbufferFormatEnums = [
        GL_RGBA4$2,
        GL_RGB5_A1$2,
        GL_RGB565$2,
        GL_SRGB8_ALPHA8_EXT$1,
        GL_RGBA16F_EXT$1,
        GL_RGB16F_EXT$1,
        GL_RGBA32F_EXT$1
      ];
      var statusCode = {};
      statusCode[GL_FRAMEBUFFER_COMPLETE$1] = "complete";
      statusCode[GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT] = "incomplete attachment";
      statusCode[GL_FRAMEBUFFER_INCOMPLETE_DIMENSIONS] = "incomplete dimensions";
      statusCode[GL_FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT] = "incomplete, missing attachment";
      statusCode[GL_FRAMEBUFFER_UNSUPPORTED] = "unsupported";
      function wrapFBOState(gl, extensions, limits, textureState, renderbufferState, stats2) {
        var framebufferState = {
          cur: null,
          next: null,
          dirty: false,
          setFBO: null
        };
        var colorTextureFormats = ["rgba"];
        var colorRenderbufferFormats = ["rgba4", "rgb565", "rgb5 a1"];
        if (extensions.ext_srgb) {
          colorRenderbufferFormats.push("srgba");
        }
        if (extensions.ext_color_buffer_half_float) {
          colorRenderbufferFormats.push("rgba16f", "rgb16f");
        }
        if (extensions.webgl_color_buffer_float) {
          colorRenderbufferFormats.push("rgba32f");
        }
        var colorTypes = ["uint8"];
        if (extensions.oes_texture_half_float) {
          colorTypes.push("half float", "float16");
        }
        if (extensions.oes_texture_float) {
          colorTypes.push("float", "float32");
        }
        function FramebufferAttachment(target, texture, renderbuffer) {
          this.target = target;
          this.texture = texture;
          this.renderbuffer = renderbuffer;
          var w = 0;
          var h3 = 0;
          if (texture) {
            w = texture.width;
            h3 = texture.height;
          } else if (renderbuffer) {
            w = renderbuffer.width;
            h3 = renderbuffer.height;
          }
          this.width = w;
          this.height = h3;
        }
        function decRef(attachment) {
          if (attachment) {
            if (attachment.texture) {
              attachment.texture._texture.decRef();
            }
            if (attachment.renderbuffer) {
              attachment.renderbuffer._renderbuffer.decRef();
            }
          }
        }
        function incRefAndCheckShape(attachment, width, height) {
          if (!attachment) {
            return;
          }
          if (attachment.texture) {
            var texture = attachment.texture._texture;
            var tw = Math.max(1, texture.width);
            var th = Math.max(1, texture.height);
            check$1(
              tw === width && th === height,
              "inconsistent width/height for supplied texture"
            );
            texture.refCount += 1;
          } else {
            var renderbuffer = attachment.renderbuffer._renderbuffer;
            check$1(
              renderbuffer.width === width && renderbuffer.height === height,
              "inconsistent width/height for renderbuffer"
            );
            renderbuffer.refCount += 1;
          }
        }
        function attach(location, attachment) {
          if (attachment) {
            if (attachment.texture) {
              gl.framebufferTexture2D(
                GL_FRAMEBUFFER$1,
                location,
                attachment.target,
                attachment.texture._texture.texture,
                0
              );
            } else {
              gl.framebufferRenderbuffer(
                GL_FRAMEBUFFER$1,
                location,
                GL_RENDERBUFFER$1,
                attachment.renderbuffer._renderbuffer.renderbuffer
              );
            }
          }
        }
        function parseAttachment(attachment) {
          var target = GL_TEXTURE_2D$2;
          var texture = null;
          var renderbuffer = null;
          var data = attachment;
          if (typeof attachment === "object") {
            data = attachment.data;
            if ("target" in attachment) {
              target = attachment.target | 0;
            }
          }
          check$1.type(data, "function", "invalid attachment data");
          var type2 = data._reglType;
          if (type2 === "texture2d") {
            texture = data;
            check$1(target === GL_TEXTURE_2D$2);
          } else if (type2 === "textureCube") {
            texture = data;
            check$1(
              target >= GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 && target < GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 + 6,
              "invalid cube map target"
            );
          } else if (type2 === "renderbuffer") {
            renderbuffer = data;
            target = GL_RENDERBUFFER$1;
          } else {
            check$1.raise("invalid regl object for attachment");
          }
          return new FramebufferAttachment(target, texture, renderbuffer);
        }
        function allocAttachment(width, height, isTexture, format2, type2) {
          if (isTexture) {
            var texture = textureState.create2D({
              width,
              height,
              format: format2,
              type: type2
            });
            texture._texture.refCount = 0;
            return new FramebufferAttachment(GL_TEXTURE_2D$2, texture, null);
          } else {
            var rb = renderbufferState.create({
              width,
              height,
              format: format2
            });
            rb._renderbuffer.refCount = 0;
            return new FramebufferAttachment(GL_RENDERBUFFER$1, null, rb);
          }
        }
        function unwrapAttachment(attachment) {
          return attachment && (attachment.texture || attachment.renderbuffer);
        }
        function resizeAttachment(attachment, w, h3) {
          if (attachment) {
            if (attachment.texture) {
              attachment.texture.resize(w, h3);
            } else if (attachment.renderbuffer) {
              attachment.renderbuffer.resize(w, h3);
            }
            attachment.width = w;
            attachment.height = h3;
          }
        }
        var framebufferCount = 0;
        var framebufferSet = {};
        function REGLFramebuffer() {
          this.id = framebufferCount++;
          framebufferSet[this.id] = this;
          this.framebuffer = gl.createFramebuffer();
          this.width = 0;
          this.height = 0;
          this.colorAttachments = [];
          this.depthAttachment = null;
          this.stencilAttachment = null;
          this.depthStencilAttachment = null;
        }
        function decFBORefs(framebuffer) {
          framebuffer.colorAttachments.forEach(decRef);
          decRef(framebuffer.depthAttachment);
          decRef(framebuffer.stencilAttachment);
          decRef(framebuffer.depthStencilAttachment);
        }
        function destroy(framebuffer) {
          var handle = framebuffer.framebuffer;
          check$1(handle, "must not double destroy framebuffer");
          gl.deleteFramebuffer(handle);
          framebuffer.framebuffer = null;
          stats2.framebufferCount--;
          delete framebufferSet[framebuffer.id];
        }
        function updateFramebuffer(framebuffer) {
          var i;
          gl.bindFramebuffer(GL_FRAMEBUFFER$1, framebuffer.framebuffer);
          var colorAttachments = framebuffer.colorAttachments;
          for (i = 0; i < colorAttachments.length; ++i) {
            attach(GL_COLOR_ATTACHMENT0$1 + i, colorAttachments[i]);
          }
          for (i = colorAttachments.length; i < limits.maxColorAttachments; ++i) {
            gl.framebufferTexture2D(
              GL_FRAMEBUFFER$1,
              GL_COLOR_ATTACHMENT0$1 + i,
              GL_TEXTURE_2D$2,
              null,
              0
            );
          }
          gl.framebufferTexture2D(
            GL_FRAMEBUFFER$1,
            GL_DEPTH_STENCIL_ATTACHMENT,
            GL_TEXTURE_2D$2,
            null,
            0
          );
          gl.framebufferTexture2D(
            GL_FRAMEBUFFER$1,
            GL_DEPTH_ATTACHMENT,
            GL_TEXTURE_2D$2,
            null,
            0
          );
          gl.framebufferTexture2D(
            GL_FRAMEBUFFER$1,
            GL_STENCIL_ATTACHMENT,
            GL_TEXTURE_2D$2,
            null,
            0
          );
          attach(GL_DEPTH_ATTACHMENT, framebuffer.depthAttachment);
          attach(GL_STENCIL_ATTACHMENT, framebuffer.stencilAttachment);
          attach(GL_DEPTH_STENCIL_ATTACHMENT, framebuffer.depthStencilAttachment);
          var status = gl.checkFramebufferStatus(GL_FRAMEBUFFER$1);
          if (!gl.isContextLost() && status !== GL_FRAMEBUFFER_COMPLETE$1) {
            check$1.raise("framebuffer configuration not supported, status = " + statusCode[status]);
          }
          gl.bindFramebuffer(GL_FRAMEBUFFER$1, framebufferState.next ? framebufferState.next.framebuffer : null);
          framebufferState.cur = framebufferState.next;
          gl.getError();
        }
        function createFBO(a0, a1) {
          var framebuffer = new REGLFramebuffer();
          stats2.framebufferCount++;
          function reglFramebuffer(a, b) {
            var i;
            check$1(
              framebufferState.next !== framebuffer,
              "can not update framebuffer which is currently in use"
            );
            var width = 0;
            var height = 0;
            var needsDepth = true;
            var needsStencil = true;
            var colorBuffer = null;
            var colorTexture = true;
            var colorFormat = "rgba";
            var colorType = "uint8";
            var colorCount = 1;
            var depthBuffer = null;
            var stencilBuffer = null;
            var depthStencilBuffer = null;
            var depthStencilTexture = false;
            if (typeof a === "number") {
              width = a | 0;
              height = b | 0 || width;
            } else if (!a) {
              width = height = 1;
            } else {
              check$1.type(a, "object", "invalid arguments for framebuffer");
              var options = a;
              if ("shape" in options) {
                var shape = options.shape;
                check$1(
                  Array.isArray(shape) && shape.length >= 2,
                  "invalid shape for framebuffer"
                );
                width = shape[0];
                height = shape[1];
              } else {
                if ("radius" in options) {
                  width = height = options.radius;
                }
                if ("width" in options) {
                  width = options.width;
                }
                if ("height" in options) {
                  height = options.height;
                }
              }
              if ("color" in options || "colors" in options) {
                colorBuffer = options.color || options.colors;
                if (Array.isArray(colorBuffer)) {
                  check$1(
                    colorBuffer.length === 1 || extensions.webgl_draw_buffers,
                    "multiple render targets not supported"
                  );
                }
              }
              if (!colorBuffer) {
                if ("colorCount" in options) {
                  colorCount = options.colorCount | 0;
                  check$1(colorCount > 0, "invalid color buffer count");
                }
                if ("colorTexture" in options) {
                  colorTexture = !!options.colorTexture;
                  colorFormat = "rgba4";
                }
                if ("colorType" in options) {
                  colorType = options.colorType;
                  if (!colorTexture) {
                    if (colorType === "half float" || colorType === "float16") {
                      check$1(
                        extensions.ext_color_buffer_half_float,
                        "you must enable EXT_color_buffer_half_float to use 16-bit render buffers"
                      );
                      colorFormat = "rgba16f";
                    } else if (colorType === "float" || colorType === "float32") {
                      check$1(
                        extensions.webgl_color_buffer_float,
                        "you must enable WEBGL_color_buffer_float in order to use 32-bit floating point renderbuffers"
                      );
                      colorFormat = "rgba32f";
                    }
                  } else {
                    check$1(
                      extensions.oes_texture_float || !(colorType === "float" || colorType === "float32"),
                      "you must enable OES_texture_float in order to use floating point framebuffer objects"
                    );
                    check$1(
                      extensions.oes_texture_half_float || !(colorType === "half float" || colorType === "float16"),
                      "you must enable OES_texture_half_float in order to use 16-bit floating point framebuffer objects"
                    );
                  }
                  check$1.oneOf(colorType, colorTypes, "invalid color type");
                }
                if ("colorFormat" in options) {
                  colorFormat = options.colorFormat;
                  if (colorTextureFormats.indexOf(colorFormat) >= 0) {
                    colorTexture = true;
                  } else if (colorRenderbufferFormats.indexOf(colorFormat) >= 0) {
                    colorTexture = false;
                  } else {
                    check$1.optional(function() {
                      if (colorTexture) {
                        check$1.oneOf(
                          options.colorFormat,
                          colorTextureFormats,
                          "invalid color format for texture"
                        );
                      } else {
                        check$1.oneOf(
                          options.colorFormat,
                          colorRenderbufferFormats,
                          "invalid color format for renderbuffer"
                        );
                      }
                    });
                  }
                }
              }
              if ("depthTexture" in options || "depthStencilTexture" in options) {
                depthStencilTexture = !!(options.depthTexture || options.depthStencilTexture);
                check$1(
                  !depthStencilTexture || extensions.webgl_depth_texture,
                  "webgl_depth_texture extension not supported"
                );
              }
              if ("depth" in options) {
                if (typeof options.depth === "boolean") {
                  needsDepth = options.depth;
                } else {
                  depthBuffer = options.depth;
                  needsStencil = false;
                }
              }
              if ("stencil" in options) {
                if (typeof options.stencil === "boolean") {
                  needsStencil = options.stencil;
                } else {
                  stencilBuffer = options.stencil;
                  needsDepth = false;
                }
              }
              if ("depthStencil" in options) {
                if (typeof options.depthStencil === "boolean") {
                  needsDepth = needsStencil = options.depthStencil;
                } else {
                  depthStencilBuffer = options.depthStencil;
                  needsDepth = false;
                  needsStencil = false;
                }
              }
            }
            var colorAttachments = null;
            var depthAttachment = null;
            var stencilAttachment = null;
            var depthStencilAttachment = null;
            if (Array.isArray(colorBuffer)) {
              colorAttachments = colorBuffer.map(parseAttachment);
            } else if (colorBuffer) {
              colorAttachments = [parseAttachment(colorBuffer)];
            } else {
              colorAttachments = new Array(colorCount);
              for (i = 0; i < colorCount; ++i) {
                colorAttachments[i] = allocAttachment(
                  width,
                  height,
                  colorTexture,
                  colorFormat,
                  colorType
                );
              }
            }
            check$1(
              extensions.webgl_draw_buffers || colorAttachments.length <= 1,
              "you must enable the WEBGL_draw_buffers extension in order to use multiple color buffers."
            );
            check$1(
              colorAttachments.length <= limits.maxColorAttachments,
              "too many color attachments, not supported"
            );
            width = width || colorAttachments[0].width;
            height = height || colorAttachments[0].height;
            if (depthBuffer) {
              depthAttachment = parseAttachment(depthBuffer);
            } else if (needsDepth && !needsStencil) {
              depthAttachment = allocAttachment(
                width,
                height,
                depthStencilTexture,
                "depth",
                "uint32"
              );
            }
            if (stencilBuffer) {
              stencilAttachment = parseAttachment(stencilBuffer);
            } else if (needsStencil && !needsDepth) {
              stencilAttachment = allocAttachment(
                width,
                height,
                false,
                "stencil",
                "uint8"
              );
            }
            if (depthStencilBuffer) {
              depthStencilAttachment = parseAttachment(depthStencilBuffer);
            } else if (!depthBuffer && !stencilBuffer && needsStencil && needsDepth) {
              depthStencilAttachment = allocAttachment(
                width,
                height,
                depthStencilTexture,
                "depth stencil",
                "depth stencil"
              );
            }
            check$1(
              !!depthBuffer + !!stencilBuffer + !!depthStencilBuffer <= 1,
              "invalid framebuffer configuration, can specify exactly one depth/stencil attachment"
            );
            var commonColorAttachmentSize = null;
            for (i = 0; i < colorAttachments.length; ++i) {
              incRefAndCheckShape(colorAttachments[i], width, height);
              check$1(
                !colorAttachments[i] || colorAttachments[i].texture && colorTextureFormatEnums.indexOf(colorAttachments[i].texture._texture.format) >= 0 || colorAttachments[i].renderbuffer && colorRenderbufferFormatEnums.indexOf(colorAttachments[i].renderbuffer._renderbuffer.format) >= 0,
                "framebuffer color attachment " + i + " is invalid"
              );
              if (colorAttachments[i] && colorAttachments[i].texture) {
                var colorAttachmentSize = textureFormatChannels[colorAttachments[i].texture._texture.format] * textureTypeSizes[colorAttachments[i].texture._texture.type];
                if (commonColorAttachmentSize === null) {
                  commonColorAttachmentSize = colorAttachmentSize;
                } else {
                  check$1(
                    commonColorAttachmentSize === colorAttachmentSize,
                    "all color attachments much have the same number of bits per pixel."
                  );
                }
              }
            }
            incRefAndCheckShape(depthAttachment, width, height);
            check$1(
              !depthAttachment || depthAttachment.texture && depthAttachment.texture._texture.format === GL_DEPTH_COMPONENT$1 || depthAttachment.renderbuffer && depthAttachment.renderbuffer._renderbuffer.format === GL_DEPTH_COMPONENT16$1,
              "invalid depth attachment for framebuffer object"
            );
            incRefAndCheckShape(stencilAttachment, width, height);
            check$1(
              !stencilAttachment || stencilAttachment.renderbuffer && stencilAttachment.renderbuffer._renderbuffer.format === GL_STENCIL_INDEX8$1,
              "invalid stencil attachment for framebuffer object"
            );
            incRefAndCheckShape(depthStencilAttachment, width, height);
            check$1(
              !depthStencilAttachment || depthStencilAttachment.texture && depthStencilAttachment.texture._texture.format === GL_DEPTH_STENCIL$2 || depthStencilAttachment.renderbuffer && depthStencilAttachment.renderbuffer._renderbuffer.format === GL_DEPTH_STENCIL$2,
              "invalid depth-stencil attachment for framebuffer object"
            );
            decFBORefs(framebuffer);
            framebuffer.width = width;
            framebuffer.height = height;
            framebuffer.colorAttachments = colorAttachments;
            framebuffer.depthAttachment = depthAttachment;
            framebuffer.stencilAttachment = stencilAttachment;
            framebuffer.depthStencilAttachment = depthStencilAttachment;
            reglFramebuffer.color = colorAttachments.map(unwrapAttachment);
            reglFramebuffer.depth = unwrapAttachment(depthAttachment);
            reglFramebuffer.stencil = unwrapAttachment(stencilAttachment);
            reglFramebuffer.depthStencil = unwrapAttachment(depthStencilAttachment);
            reglFramebuffer.width = framebuffer.width;
            reglFramebuffer.height = framebuffer.height;
            updateFramebuffer(framebuffer);
            return reglFramebuffer;
          }
          function resize(w_, h_) {
            check$1(
              framebufferState.next !== framebuffer,
              "can not resize a framebuffer which is currently in use"
            );
            var w = Math.max(w_ | 0, 1);
            var h3 = Math.max(h_ | 0 || w, 1);
            if (w === framebuffer.width && h3 === framebuffer.height) {
              return reglFramebuffer;
            }
            var colorAttachments = framebuffer.colorAttachments;
            for (var i = 0; i < colorAttachments.length; ++i) {
              resizeAttachment(colorAttachments[i], w, h3);
            }
            resizeAttachment(framebuffer.depthAttachment, w, h3);
            resizeAttachment(framebuffer.stencilAttachment, w, h3);
            resizeAttachment(framebuffer.depthStencilAttachment, w, h3);
            framebuffer.width = reglFramebuffer.width = w;
            framebuffer.height = reglFramebuffer.height = h3;
            updateFramebuffer(framebuffer);
            return reglFramebuffer;
          }
          reglFramebuffer(a0, a1);
          return extend2(reglFramebuffer, {
            resize,
            _reglType: "framebuffer",
            _framebuffer: framebuffer,
            destroy: function() {
              destroy(framebuffer);
              decFBORefs(framebuffer);
            },
            use: function(block) {
              framebufferState.setFBO({
                framebuffer: reglFramebuffer
              }, block);
            }
          });
        }
        function createCubeFBO(options) {
          var faces = Array(6);
          function reglFramebufferCube(a) {
            var i;
            check$1(
              faces.indexOf(framebufferState.next) < 0,
              "can not update framebuffer which is currently in use"
            );
            var params = {
              color: null
            };
            var radius = 0;
            var colorBuffer = null;
            var colorFormat = "rgba";
            var colorType = "uint8";
            var colorCount = 1;
            if (typeof a === "number") {
              radius = a | 0;
            } else if (!a) {
              radius = 1;
            } else {
              check$1.type(a, "object", "invalid arguments for framebuffer");
              var options2 = a;
              if ("shape" in options2) {
                var shape = options2.shape;
                check$1(
                  Array.isArray(shape) && shape.length >= 2,
                  "invalid shape for framebuffer"
                );
                check$1(
                  shape[0] === shape[1],
                  "cube framebuffer must be square"
                );
                radius = shape[0];
              } else {
                if ("radius" in options2) {
                  radius = options2.radius | 0;
                }
                if ("width" in options2) {
                  radius = options2.width | 0;
                  if ("height" in options2) {
                    check$1(options2.height === radius, "must be square");
                  }
                } else if ("height" in options2) {
                  radius = options2.height | 0;
                }
              }
              if ("color" in options2 || "colors" in options2) {
                colorBuffer = options2.color || options2.colors;
                if (Array.isArray(colorBuffer)) {
                  check$1(
                    colorBuffer.length === 1 || extensions.webgl_draw_buffers,
                    "multiple render targets not supported"
                  );
                }
              }
              if (!colorBuffer) {
                if ("colorCount" in options2) {
                  colorCount = options2.colorCount | 0;
                  check$1(colorCount > 0, "invalid color buffer count");
                }
                if ("colorType" in options2) {
                  check$1.oneOf(
                    options2.colorType,
                    colorTypes,
                    "invalid color type"
                  );
                  colorType = options2.colorType;
                }
                if ("colorFormat" in options2) {
                  colorFormat = options2.colorFormat;
                  check$1.oneOf(
                    options2.colorFormat,
                    colorTextureFormats,
                    "invalid color format for texture"
                  );
                }
              }
              if ("depth" in options2) {
                params.depth = options2.depth;
              }
              if ("stencil" in options2) {
                params.stencil = options2.stencil;
              }
              if ("depthStencil" in options2) {
                params.depthStencil = options2.depthStencil;
              }
            }
            var colorCubes;
            if (colorBuffer) {
              if (Array.isArray(colorBuffer)) {
                colorCubes = [];
                for (i = 0; i < colorBuffer.length; ++i) {
                  colorCubes[i] = colorBuffer[i];
                }
              } else {
                colorCubes = [colorBuffer];
              }
            } else {
              colorCubes = Array(colorCount);
              var cubeMapParams = {
                radius,
                format: colorFormat,
                type: colorType
              };
              for (i = 0; i < colorCount; ++i) {
                colorCubes[i] = textureState.createCube(cubeMapParams);
              }
            }
            params.color = Array(colorCubes.length);
            for (i = 0; i < colorCubes.length; ++i) {
              var cube = colorCubes[i];
              check$1(
                typeof cube === "function" && cube._reglType === "textureCube",
                "invalid cube map"
              );
              radius = radius || cube.width;
              check$1(
                cube.width === radius && cube.height === radius,
                "invalid cube map shape"
              );
              params.color[i] = {
                target: GL_TEXTURE_CUBE_MAP_POSITIVE_X$2,
                data: colorCubes[i]
              };
            }
            for (i = 0; i < 6; ++i) {
              for (var j = 0; j < colorCubes.length; ++j) {
                params.color[j].target = GL_TEXTURE_CUBE_MAP_POSITIVE_X$2 + i;
              }
              if (i > 0) {
                params.depth = faces[0].depth;
                params.stencil = faces[0].stencil;
                params.depthStencil = faces[0].depthStencil;
              }
              if (faces[i]) {
                faces[i](params);
              } else {
                faces[i] = createFBO(params);
              }
            }
            return extend2(reglFramebufferCube, {
              width: radius,
              height: radius,
              color: colorCubes
            });
          }
          function resize(radius_) {
            var i;
            var radius = radius_ | 0;
            check$1(
              radius > 0 && radius <= limits.maxCubeMapSize,
              "invalid radius for cube fbo"
            );
            if (radius === reglFramebufferCube.width) {
              return reglFramebufferCube;
            }
            var colors = reglFramebufferCube.color;
            for (i = 0; i < colors.length; ++i) {
              colors[i].resize(radius);
            }
            for (i = 0; i < 6; ++i) {
              faces[i].resize(radius);
            }
            reglFramebufferCube.width = reglFramebufferCube.height = radius;
            return reglFramebufferCube;
          }
          reglFramebufferCube(options);
          return extend2(reglFramebufferCube, {
            faces,
            resize,
            _reglType: "framebufferCube",
            destroy: function() {
              faces.forEach(function(f) {
                f.destroy();
              });
            }
          });
        }
        function restoreFramebuffers() {
          framebufferState.cur = null;
          framebufferState.next = null;
          framebufferState.dirty = true;
          values(framebufferSet).forEach(function(fb) {
            fb.framebuffer = gl.createFramebuffer();
            updateFramebuffer(fb);
          });
        }
        return extend2(framebufferState, {
          getFramebuffer: function(object) {
            if (typeof object === "function" && object._reglType === "framebuffer") {
              var fbo = object._framebuffer;
              if (fbo instanceof REGLFramebuffer) {
                return fbo;
              }
            }
            return null;
          },
          create: createFBO,
          createCube: createCubeFBO,
          clear: function() {
            values(framebufferSet).forEach(destroy);
          },
          restore: restoreFramebuffers
        });
      }
      var GL_FLOAT$6 = 5126;
      var GL_ARRAY_BUFFER$1 = 34962;
      var GL_ELEMENT_ARRAY_BUFFER$1 = 34963;
      var VAO_OPTIONS = [
        "attributes",
        "elements",
        "offset",
        "count",
        "primitive",
        "instances"
      ];
      function AttributeRecord() {
        this.state = 0;
        this.x = 0;
        this.y = 0;
        this.z = 0;
        this.w = 0;
        this.buffer = null;
        this.size = 0;
        this.normalized = false;
        this.type = GL_FLOAT$6;
        this.offset = 0;
        this.stride = 0;
        this.divisor = 0;
      }
      function wrapAttributeState(gl, extensions, limits, stats2, bufferState, elementState, drawState) {
        var NUM_ATTRIBUTES = limits.maxAttributes;
        var attributeBindings = new Array(NUM_ATTRIBUTES);
        for (var i = 0; i < NUM_ATTRIBUTES; ++i) {
          attributeBindings[i] = new AttributeRecord();
        }
        var vaoCount = 0;
        var vaoSet = {};
        var state = {
          Record: AttributeRecord,
          scope: {},
          state: attributeBindings,
          currentVAO: null,
          targetVAO: null,
          restore: extVAO() ? restoreVAO : function() {
          },
          createVAO,
          getVAO,
          destroyBuffer,
          setVAO: extVAO() ? setVAOEXT : setVAOEmulated,
          clear: extVAO() ? destroyVAOEXT : function() {
          }
        };
        function destroyBuffer(buffer) {
          for (var i2 = 0; i2 < attributeBindings.length; ++i2) {
            var record = attributeBindings[i2];
            if (record.buffer === buffer) {
              gl.disableVertexAttribArray(i2);
              record.buffer = null;
            }
          }
        }
        function extVAO() {
          return extensions.oes_vertex_array_object;
        }
        function extInstanced() {
          return extensions.angle_instanced_arrays;
        }
        function getVAO(vao) {
          if (typeof vao === "function" && vao._vao) {
            return vao._vao;
          }
          return null;
        }
        function setVAOEXT(vao) {
          if (vao === state.currentVAO) {
            return;
          }
          var ext = extVAO();
          if (vao) {
            ext.bindVertexArrayOES(vao.vao);
          } else {
            ext.bindVertexArrayOES(null);
          }
          state.currentVAO = vao;
        }
        function setVAOEmulated(vao) {
          if (vao === state.currentVAO) {
            return;
          }
          if (vao) {
            vao.bindAttrs();
          } else {
            var exti = extInstanced();
            for (var i2 = 0; i2 < attributeBindings.length; ++i2) {
              var binding = attributeBindings[i2];
              if (binding.buffer) {
                gl.enableVertexAttribArray(i2);
                binding.buffer.bind();
                gl.vertexAttribPointer(i2, binding.size, binding.type, binding.normalized, binding.stride, binding.offfset);
                if (exti && binding.divisor) {
                  exti.vertexAttribDivisorANGLE(i2, binding.divisor);
                }
              } else {
                gl.disableVertexAttribArray(i2);
                gl.vertexAttrib4f(i2, binding.x, binding.y, binding.z, binding.w);
              }
            }
            if (drawState.elements) {
              gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, drawState.elements.buffer.buffer);
            } else {
              gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, null);
            }
          }
          state.currentVAO = vao;
        }
        function destroyVAOEXT() {
          values(vaoSet).forEach(function(vao) {
            vao.destroy();
          });
        }
        function REGLVAO() {
          this.id = ++vaoCount;
          this.attributes = [];
          this.elements = null;
          this.ownsElements = false;
          this.count = 0;
          this.offset = 0;
          this.instances = -1;
          this.primitive = 4;
          var extension = extVAO();
          if (extension) {
            this.vao = extension.createVertexArrayOES();
          } else {
            this.vao = null;
          }
          vaoSet[this.id] = this;
          this.buffers = [];
        }
        REGLVAO.prototype.bindAttrs = function() {
          var exti = extInstanced();
          var attributes = this.attributes;
          for (var i2 = 0; i2 < attributes.length; ++i2) {
            var attr = attributes[i2];
            if (attr.buffer) {
              gl.enableVertexAttribArray(i2);
              gl.bindBuffer(GL_ARRAY_BUFFER$1, attr.buffer.buffer);
              gl.vertexAttribPointer(i2, attr.size, attr.type, attr.normalized, attr.stride, attr.offset);
              if (exti && attr.divisor) {
                exti.vertexAttribDivisorANGLE(i2, attr.divisor);
              }
            } else {
              gl.disableVertexAttribArray(i2);
              gl.vertexAttrib4f(i2, attr.x, attr.y, attr.z, attr.w);
            }
          }
          for (var j = attributes.length; j < NUM_ATTRIBUTES; ++j) {
            gl.disableVertexAttribArray(j);
          }
          var elements = elementState.getElements(this.elements);
          if (elements) {
            gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, elements.buffer.buffer);
          } else {
            gl.bindBuffer(GL_ELEMENT_ARRAY_BUFFER$1, null);
          }
        };
        REGLVAO.prototype.refresh = function() {
          var ext = extVAO();
          if (ext) {
            ext.bindVertexArrayOES(this.vao);
            this.bindAttrs();
            state.currentVAO = null;
            ext.bindVertexArrayOES(null);
          }
        };
        REGLVAO.prototype.destroy = function() {
          if (this.vao) {
            var extension = extVAO();
            if (this === state.currentVAO) {
              state.currentVAO = null;
              extension.bindVertexArrayOES(null);
            }
            extension.deleteVertexArrayOES(this.vao);
            this.vao = null;
          }
          if (this.ownsElements) {
            this.elements.destroy();
            this.elements = null;
            this.ownsElements = false;
          }
          if (vaoSet[this.id]) {
            delete vaoSet[this.id];
            stats2.vaoCount -= 1;
          }
        };
        function restoreVAO() {
          var ext = extVAO();
          if (ext) {
            values(vaoSet).forEach(function(vao) {
              vao.refresh();
            });
          }
        }
        function createVAO(_attr) {
          var vao = new REGLVAO();
          stats2.vaoCount += 1;
          function updateVAO(options) {
            var attributes;
            if (Array.isArray(options)) {
              attributes = options;
              if (vao.elements && vao.ownsElements) {
                vao.elements.destroy();
              }
              vao.elements = null;
              vao.ownsElements = false;
              vao.offset = 0;
              vao.count = 0;
              vao.instances = -1;
              vao.primitive = 4;
            } else {
              check$1(typeof options === "object", "invalid arguments for create vao");
              check$1("attributes" in options, "must specify attributes for vao");
              if (options.elements) {
                var elements = options.elements;
                if (vao.ownsElements) {
                  if (typeof elements === "function" && elements._reglType === "elements") {
                    vao.elements.destroy();
                    vao.ownsElements = false;
                  } else {
                    vao.elements(elements);
                    vao.ownsElements = false;
                  }
                } else if (elementState.getElements(options.elements)) {
                  vao.elements = options.elements;
                  vao.ownsElements = false;
                } else {
                  vao.elements = elementState.create(options.elements);
                  vao.ownsElements = true;
                }
              } else {
                vao.elements = null;
                vao.ownsElements = false;
              }
              attributes = options.attributes;
              vao.offset = 0;
              vao.count = -1;
              vao.instances = -1;
              vao.primitive = 4;
              if (vao.elements) {
                vao.count = vao.elements._elements.vertCount;
                vao.primitive = vao.elements._elements.primType;
              }
              if ("offset" in options) {
                vao.offset = options.offset | 0;
              }
              if ("count" in options) {
                vao.count = options.count | 0;
              }
              if ("instances" in options) {
                vao.instances = options.instances | 0;
              }
              if ("primitive" in options) {
                check$1(options.primitive in primTypes, "bad primitive type: " + options.primitive);
                vao.primitive = primTypes[options.primitive];
              }
              check$1.optional(() => {
                var keys = Object.keys(options);
                for (var i3 = 0; i3 < keys.length; ++i3) {
                  check$1(VAO_OPTIONS.indexOf(keys[i3]) >= 0, 'invalid option for vao: "' + keys[i3] + '" valid options are ' + VAO_OPTIONS);
                }
              });
              check$1(Array.isArray(attributes), "attributes must be an array");
            }
            check$1(attributes.length < NUM_ATTRIBUTES, "too many attributes");
            check$1(attributes.length > 0, "must specify at least one attribute");
            var bufUpdated = {};
            var nattributes = vao.attributes;
            nattributes.length = attributes.length;
            for (var i2 = 0; i2 < attributes.length; ++i2) {
              var spec = attributes[i2];
              var rec = nattributes[i2] = new AttributeRecord();
              var data = spec.data || spec;
              if (Array.isArray(data) || isTypedArray(data) || isNDArrayLike(data)) {
                var buf;
                if (vao.buffers[i2]) {
                  buf = vao.buffers[i2];
                  if (isTypedArray(data) && buf._buffer.byteLength >= data.byteLength) {
                    buf.subdata(data);
                  } else {
                    buf.destroy();
                    vao.buffers[i2] = null;
                  }
                }
                if (!vao.buffers[i2]) {
                  buf = vao.buffers[i2] = bufferState.create(spec, GL_ARRAY_BUFFER$1, false, true);
                }
                rec.buffer = bufferState.getBuffer(buf);
                rec.size = rec.buffer.dimension | 0;
                rec.normalized = false;
                rec.type = rec.buffer.dtype;
                rec.offset = 0;
                rec.stride = 0;
                rec.divisor = 0;
                rec.state = 1;
                bufUpdated[i2] = 1;
              } else if (bufferState.getBuffer(spec)) {
                rec.buffer = bufferState.getBuffer(spec);
                rec.size = rec.buffer.dimension | 0;
                rec.normalized = false;
                rec.type = rec.buffer.dtype;
                rec.offset = 0;
                rec.stride = 0;
                rec.divisor = 0;
                rec.state = 1;
              } else if (bufferState.getBuffer(spec.buffer)) {
                rec.buffer = bufferState.getBuffer(spec.buffer);
                rec.size = (+spec.size || rec.buffer.dimension) | 0;
                rec.normalized = !!spec.normalized || false;
                if ("type" in spec) {
                  check$1.parameter(spec.type, glTypes, "invalid buffer type");
                  rec.type = glTypes[spec.type];
                } else {
                  rec.type = rec.buffer.dtype;
                }
                rec.offset = (spec.offset || 0) | 0;
                rec.stride = (spec.stride || 0) | 0;
                rec.divisor = (spec.divisor || 0) | 0;
                rec.state = 1;
                check$1(rec.size >= 1 && rec.size <= 4, "size must be between 1 and 4");
                check$1(rec.offset >= 0, "invalid offset");
                check$1(rec.stride >= 0 && rec.stride <= 255, "stride must be between 0 and 255");
                check$1(rec.divisor >= 0, "divisor must be positive");
                check$1(!rec.divisor || !!extensions.angle_instanced_arrays, "ANGLE_instanced_arrays must be enabled to use divisor");
              } else if ("x" in spec) {
                check$1(i2 > 0, "first attribute must not be a constant");
                rec.x = +spec.x || 0;
                rec.y = +spec.y || 0;
                rec.z = +spec.z || 0;
                rec.w = +spec.w || 0;
                rec.state = 2;
              } else {
                check$1(false, "invalid attribute spec for location " + i2);
              }
            }
            for (var j = 0; j < vao.buffers.length; ++j) {
              if (!bufUpdated[j] && vao.buffers[j]) {
                vao.buffers[j].destroy();
                vao.buffers[j] = null;
              }
            }
            vao.refresh();
            return updateVAO;
          }
          updateVAO.destroy = function() {
            for (var j = 0; j < vao.buffers.length; ++j) {
              if (vao.buffers[j]) {
                vao.buffers[j].destroy();
              }
            }
            vao.buffers.length = 0;
            if (vao.ownsElements) {
              vao.elements.destroy();
              vao.elements = null;
              vao.ownsElements = false;
            }
            vao.destroy();
          };
          updateVAO._vao = vao;
          updateVAO._reglType = "vao";
          return updateVAO(_attr);
        }
        return state;
      }
      var GL_FRAGMENT_SHADER = 35632;
      var GL_VERTEX_SHADER = 35633;
      var GL_ACTIVE_UNIFORMS = 35718;
      var GL_ACTIVE_ATTRIBUTES = 35721;
      function wrapShaderState(gl, stringStore, stats2, config) {
        var fragShaders = {};
        var vertShaders = {};
        function ActiveInfo(name, id2, location, info) {
          this.name = name;
          this.id = id2;
          this.location = location;
          this.info = info;
        }
        function insertActiveInfo(list, info) {
          for (var i = 0; i < list.length; ++i) {
            if (list[i].id === info.id) {
              list[i].location = info.location;
              return;
            }
          }
          list.push(info);
        }
        function getShader(type2, id2, command) {
          var cache = type2 === GL_FRAGMENT_SHADER ? fragShaders : vertShaders;
          var shader = cache[id2];
          if (!shader) {
            var source = stringStore.str(id2);
            shader = gl.createShader(type2);
            gl.shaderSource(shader, source);
            gl.compileShader(shader);
            check$1.shaderError(gl, shader, source, type2, command);
            cache[id2] = shader;
          }
          return shader;
        }
        var programCache = {};
        var programList = [];
        var PROGRAM_COUNTER = 0;
        function REGLProgram(fragId, vertId) {
          this.id = PROGRAM_COUNTER++;
          this.fragId = fragId;
          this.vertId = vertId;
          this.program = null;
          this.uniforms = [];
          this.attributes = [];
          this.refCount = 1;
          if (config.profile) {
            this.stats = {
              uniformsCount: 0,
              attributesCount: 0
            };
          }
        }
        function linkProgram(desc, command, attributeLocations) {
          var i, info;
          var fragShader = getShader(GL_FRAGMENT_SHADER, desc.fragId);
          var vertShader = getShader(GL_VERTEX_SHADER, desc.vertId);
          var program = desc.program = gl.createProgram();
          gl.attachShader(program, fragShader);
          gl.attachShader(program, vertShader);
          if (attributeLocations) {
            for (i = 0; i < attributeLocations.length; ++i) {
              var binding = attributeLocations[i];
              gl.bindAttribLocation(program, binding[0], binding[1]);
            }
          }
          gl.linkProgram(program);
          check$1.linkError(
            gl,
            program,
            stringStore.str(desc.fragId),
            stringStore.str(desc.vertId),
            command
          );
          var numUniforms = gl.getProgramParameter(program, GL_ACTIVE_UNIFORMS);
          if (config.profile) {
            desc.stats.uniformsCount = numUniforms;
          }
          var uniforms = desc.uniforms;
          for (i = 0; i < numUniforms; ++i) {
            info = gl.getActiveUniform(program, i);
            if (info) {
              if (info.size > 1) {
                for (var j = 0; j < info.size; ++j) {
                  var name = info.name.replace("[0]", "[" + j + "]");
                  insertActiveInfo(uniforms, new ActiveInfo(
                    name,
                    stringStore.id(name),
                    gl.getUniformLocation(program, name),
                    info
                  ));
                }
              } else {
                insertActiveInfo(uniforms, new ActiveInfo(
                  info.name,
                  stringStore.id(info.name),
                  gl.getUniformLocation(program, info.name),
                  info
                ));
              }
            }
          }
          var numAttributes = gl.getProgramParameter(program, GL_ACTIVE_ATTRIBUTES);
          if (config.profile) {
            desc.stats.attributesCount = numAttributes;
          }
          var attributes = desc.attributes;
          for (i = 0; i < numAttributes; ++i) {
            info = gl.getActiveAttrib(program, i);
            if (info) {
              insertActiveInfo(attributes, new ActiveInfo(
                info.name,
                stringStore.id(info.name),
                gl.getAttribLocation(program, info.name),
                info
              ));
            }
          }
        }
        if (config.profile) {
          stats2.getMaxUniformsCount = function() {
            var m = 0;
            programList.forEach(function(desc) {
              if (desc.stats.uniformsCount > m) {
                m = desc.stats.uniformsCount;
              }
            });
            return m;
          };
          stats2.getMaxAttributesCount = function() {
            var m = 0;
            programList.forEach(function(desc) {
              if (desc.stats.attributesCount > m) {
                m = desc.stats.attributesCount;
              }
            });
            return m;
          };
        }
        function restoreShaders() {
          fragShaders = {};
          vertShaders = {};
          for (var i = 0; i < programList.length; ++i) {
            linkProgram(programList[i], null, programList[i].attributes.map(function(info) {
              return [info.location, info.name];
            }));
          }
        }
        return {
          clear: function() {
            var deleteShader = gl.deleteShader.bind(gl);
            values(fragShaders).forEach(deleteShader);
            fragShaders = {};
            values(vertShaders).forEach(deleteShader);
            vertShaders = {};
            programList.forEach(function(desc) {
              gl.deleteProgram(desc.program);
            });
            programList.length = 0;
            programCache = {};
            stats2.shaderCount = 0;
          },
          program: function(vertId, fragId, command, attribLocations) {
            check$1.command(vertId >= 0, "missing vertex shader", command);
            check$1.command(fragId >= 0, "missing fragment shader", command);
            var cache = programCache[fragId];
            if (!cache) {
              cache = programCache[fragId] = {};
            }
            var prevProgram = cache[vertId];
            if (prevProgram) {
              prevProgram.refCount++;
              if (!attribLocations) {
                return prevProgram;
              }
            }
            var program = new REGLProgram(fragId, vertId);
            stats2.shaderCount++;
            linkProgram(program, command, attribLocations);
            if (!prevProgram) {
              cache[vertId] = program;
            }
            programList.push(program);
            return extend2(program, {
              destroy: function() {
                program.refCount--;
                if (program.refCount <= 0) {
                  gl.deleteProgram(program.program);
                  var idx = programList.indexOf(program);
                  programList.splice(idx, 1);
                  stats2.shaderCount--;
                }
                if (cache[program.vertId].refCount <= 0) {
                  gl.deleteShader(vertShaders[program.vertId]);
                  delete vertShaders[program.vertId];
                  delete programCache[program.fragId][program.vertId];
                }
                if (!Object.keys(programCache[program.fragId]).length) {
                  gl.deleteShader(fragShaders[program.fragId]);
                  delete fragShaders[program.fragId];
                  delete programCache[program.fragId];
                }
              }
            });
          },
          restore: restoreShaders,
          shader: getShader,
          frag: -1,
          vert: -1
        };
      }
      var GL_RGBA$3 = 6408;
      var GL_UNSIGNED_BYTE$7 = 5121;
      var GL_PACK_ALIGNMENT = 3333;
      var GL_FLOAT$7 = 5126;
      function wrapReadPixels(gl, framebufferState, reglPoll, context, glAttributes, extensions, limits) {
        function readPixelsImpl(input) {
          var type2;
          if (framebufferState.next === null) {
            check$1(
              glAttributes.preserveDrawingBuffer,
              'you must create a webgl context with "preserveDrawingBuffer":true in order to read pixels from the drawing buffer'
            );
            type2 = GL_UNSIGNED_BYTE$7;
          } else {
            check$1(
              framebufferState.next.colorAttachments[0].texture !== null,
              "You cannot read from a renderbuffer"
            );
            type2 = framebufferState.next.colorAttachments[0].texture._texture.type;
            check$1.optional(function() {
              if (extensions.oes_texture_float) {
                check$1(
                  type2 === GL_UNSIGNED_BYTE$7 || type2 === GL_FLOAT$7,
                  "Reading from a framebuffer is only allowed for the types 'uint8' and 'float'"
                );
                if (type2 === GL_FLOAT$7) {
                  check$1(limits.readFloat, "Reading 'float' values is not permitted in your browser. For a fallback, please see: https://www.npmjs.com/package/glsl-read-float");
                }
              } else {
                check$1(
                  type2 === GL_UNSIGNED_BYTE$7,
                  "Reading from a framebuffer is only allowed for the type 'uint8'"
                );
              }
            });
          }
          var x2 = 0;
          var y2 = 0;
          var width = context.framebufferWidth;
          var height = context.framebufferHeight;
          var data = null;
          if (isTypedArray(input)) {
            data = input;
          } else if (input) {
            check$1.type(input, "object", "invalid arguments to regl.read()");
            x2 = input.x | 0;
            y2 = input.y | 0;
            check$1(
              x2 >= 0 && x2 < context.framebufferWidth,
              "invalid x offset for regl.read"
            );
            check$1(
              y2 >= 0 && y2 < context.framebufferHeight,
              "invalid y offset for regl.read"
            );
            width = (input.width || context.framebufferWidth - x2) | 0;
            height = (input.height || context.framebufferHeight - y2) | 0;
            data = input.data || null;
          }
          if (data) {
            if (type2 === GL_UNSIGNED_BYTE$7) {
              check$1(
                data instanceof Uint8Array,
                "buffer must be 'Uint8Array' when reading from a framebuffer of type 'uint8'"
              );
            } else if (type2 === GL_FLOAT$7) {
              check$1(
                data instanceof Float32Array,
                "buffer must be 'Float32Array' when reading from a framebuffer of type 'float'"
              );
            }
          }
          check$1(
            width > 0 && width + x2 <= context.framebufferWidth,
            "invalid width for read pixels"
          );
          check$1(
            height > 0 && height + y2 <= context.framebufferHeight,
            "invalid height for read pixels"
          );
          reglPoll();
          var size = width * height * 4;
          if (!data) {
            if (type2 === GL_UNSIGNED_BYTE$7) {
              data = new Uint8Array(size);
            } else if (type2 === GL_FLOAT$7) {
              data = data || new Float32Array(size);
            }
          }
          check$1.isTypedArray(data, "data buffer for regl.read() must be a typedarray");
          check$1(data.byteLength >= size, "data buffer for regl.read() too small");
          gl.pixelStorei(GL_PACK_ALIGNMENT, 4);
          gl.readPixels(
            x2,
            y2,
            width,
            height,
            GL_RGBA$3,
            type2,
            data
          );
          return data;
        }
        function readPixelsFBO(options) {
          var result;
          framebufferState.setFBO({
            framebuffer: options.framebuffer
          }, function() {
            result = readPixelsImpl(options);
          });
          return result;
        }
        function readPixels(options) {
          if (!options || !("framebuffer" in options)) {
            return readPixelsImpl(options);
          } else {
            return readPixelsFBO(options);
          }
        }
        return readPixels;
      }
      function slice2(x2) {
        return Array.prototype.slice.call(x2);
      }
      function join(x2) {
        return slice2(x2).join("");
      }
      function createEnvironment() {
        var varCounter = 0;
        var linkedNames = [];
        var linkedValues = [];
        function link(value) {
          for (var i = 0; i < linkedValues.length; ++i) {
            if (linkedValues[i] === value) {
              return linkedNames[i];
            }
          }
          var name = "g" + varCounter++;
          linkedNames.push(name);
          linkedValues.push(value);
          return name;
        }
        function block() {
          var code = [];
          function push() {
            code.push.apply(code, slice2(arguments));
          }
          var vars = [];
          function def() {
            var name = "v" + varCounter++;
            vars.push(name);
            if (arguments.length > 0) {
              code.push(name, "=");
              code.push.apply(code, slice2(arguments));
              code.push(";");
            }
            return name;
          }
          return extend2(push, {
            def,
            toString: function() {
              return join([
                vars.length > 0 ? "var " + vars.join(",") + ";" : "",
                join(code)
              ]);
            }
          });
        }
        function scope() {
          var entry = block();
          var exit = block();
          var entryToString = entry.toString;
          var exitToString = exit.toString;
          function save(object, prop) {
            exit(object, prop, "=", entry.def(object, prop), ";");
          }
          return extend2(function() {
            entry.apply(entry, slice2(arguments));
          }, {
            def: entry.def,
            entry,
            exit,
            save,
            set: function(object, prop, value) {
              save(object, prop);
              entry(object, prop, "=", value, ";");
            },
            toString: function() {
              return entryToString() + exitToString();
            }
          });
        }
        function conditional() {
          var pred = join(arguments);
          var thenBlock = scope();
          var elseBlock = scope();
          var thenToString = thenBlock.toString;
          var elseToString = elseBlock.toString;
          return extend2(thenBlock, {
            then: function() {
              thenBlock.apply(thenBlock, slice2(arguments));
              return this;
            },
            else: function() {
              elseBlock.apply(elseBlock, slice2(arguments));
              return this;
            },
            toString: function() {
              var elseClause = elseToString();
              if (elseClause) {
                elseClause = "else{" + elseClause + "}";
              }
              return join([
                "if(",
                pred,
                "){",
                thenToString(),
                "}",
                elseClause
              ]);
            }
          });
        }
        var globalBlock = block();
        var procedures = {};
        function proc(name, count) {
          var args = [];
          function arg() {
            var name2 = "a" + args.length;
            args.push(name2);
            return name2;
          }
          count = count || 0;
          for (var i = 0; i < count; ++i) {
            arg();
          }
          var body = scope();
          var bodyToString = body.toString;
          var result = procedures[name] = extend2(body, {
            arg,
            toString: function() {
              return join([
                "function(",
                args.join(),
                "){",
                bodyToString(),
                "}"
              ]);
            }
          });
          return result;
        }
        function compile() {
          var code = [
            '"use strict";',
            globalBlock,
            "return {"
          ];
          Object.keys(procedures).forEach(function(name) {
            code.push('"', name, '":', procedures[name].toString(), ",");
          });
          code.push("}");
          var src = join(code).replace(/;/g, ";\n").replace(/}/g, "}\n").replace(/{/g, "{\n");
          var proc2 = Function.apply(null, linkedNames.concat(src));
          return proc2.apply(null, linkedValues);
        }
        return {
          global: globalBlock,
          link,
          block,
          proc,
          scope,
          cond: conditional,
          compile
        };
      }
      var CUTE_COMPONENTS = "xyzw".split("");
      var GL_UNSIGNED_BYTE$8 = 5121;
      var ATTRIB_STATE_POINTER = 1;
      var ATTRIB_STATE_CONSTANT = 2;
      var DYN_FUNC$1 = 0;
      var DYN_PROP$1 = 1;
      var DYN_CONTEXT$1 = 2;
      var DYN_STATE$1 = 3;
      var DYN_THUNK = 4;
      var DYN_CONSTANT$1 = 5;
      var DYN_ARRAY$1 = 6;
      var S_DITHER = "dither";
      var S_BLEND_ENABLE = "blend.enable";
      var S_BLEND_COLOR = "blend.color";
      var S_BLEND_EQUATION = "blend.equation";
      var S_BLEND_FUNC = "blend.func";
      var S_DEPTH_ENABLE = "depth.enable";
      var S_DEPTH_FUNC = "depth.func";
      var S_DEPTH_RANGE = "depth.range";
      var S_DEPTH_MASK = "depth.mask";
      var S_COLOR_MASK = "colorMask";
      var S_CULL_ENABLE = "cull.enable";
      var S_CULL_FACE = "cull.face";
      var S_FRONT_FACE = "frontFace";
      var S_LINE_WIDTH = "lineWidth";
      var S_POLYGON_OFFSET_ENABLE = "polygonOffset.enable";
      var S_POLYGON_OFFSET_OFFSET = "polygonOffset.offset";
      var S_SAMPLE_ALPHA = "sample.alpha";
      var S_SAMPLE_ENABLE = "sample.enable";
      var S_SAMPLE_COVERAGE = "sample.coverage";
      var S_STENCIL_ENABLE = "stencil.enable";
      var S_STENCIL_MASK = "stencil.mask";
      var S_STENCIL_FUNC = "stencil.func";
      var S_STENCIL_OPFRONT = "stencil.opFront";
      var S_STENCIL_OPBACK = "stencil.opBack";
      var S_SCISSOR_ENABLE = "scissor.enable";
      var S_SCISSOR_BOX = "scissor.box";
      var S_VIEWPORT = "viewport";
      var S_PROFILE = "profile";
      var S_FRAMEBUFFER = "framebuffer";
      var S_VERT = "vert";
      var S_FRAG = "frag";
      var S_ELEMENTS = "elements";
      var S_PRIMITIVE = "primitive";
      var S_COUNT = "count";
      var S_OFFSET = "offset";
      var S_INSTANCES = "instances";
      var S_VAO = "vao";
      var SUFFIX_WIDTH = "Width";
      var SUFFIX_HEIGHT = "Height";
      var S_FRAMEBUFFER_WIDTH = S_FRAMEBUFFER + SUFFIX_WIDTH;
      var S_FRAMEBUFFER_HEIGHT = S_FRAMEBUFFER + SUFFIX_HEIGHT;
      var S_VIEWPORT_WIDTH = S_VIEWPORT + SUFFIX_WIDTH;
      var S_VIEWPORT_HEIGHT = S_VIEWPORT + SUFFIX_HEIGHT;
      var S_DRAWINGBUFFER = "drawingBuffer";
      var S_DRAWINGBUFFER_WIDTH = S_DRAWINGBUFFER + SUFFIX_WIDTH;
      var S_DRAWINGBUFFER_HEIGHT = S_DRAWINGBUFFER + SUFFIX_HEIGHT;
      var NESTED_OPTIONS = [
        S_BLEND_FUNC,
        S_BLEND_EQUATION,
        S_STENCIL_FUNC,
        S_STENCIL_OPFRONT,
        S_STENCIL_OPBACK,
        S_SAMPLE_COVERAGE,
        S_VIEWPORT,
        S_SCISSOR_BOX,
        S_POLYGON_OFFSET_OFFSET
      ];
      var GL_ARRAY_BUFFER$2 = 34962;
      var GL_ELEMENT_ARRAY_BUFFER$2 = 34963;
      var GL_FRAGMENT_SHADER$1 = 35632;
      var GL_VERTEX_SHADER$1 = 35633;
      var GL_TEXTURE_2D$3 = 3553;
      var GL_TEXTURE_CUBE_MAP$2 = 34067;
      var GL_CULL_FACE = 2884;
      var GL_BLEND = 3042;
      var GL_DITHER = 3024;
      var GL_STENCIL_TEST = 2960;
      var GL_DEPTH_TEST = 2929;
      var GL_SCISSOR_TEST = 3089;
      var GL_POLYGON_OFFSET_FILL = 32823;
      var GL_SAMPLE_ALPHA_TO_COVERAGE = 32926;
      var GL_SAMPLE_COVERAGE = 32928;
      var GL_FLOAT$8 = 5126;
      var GL_FLOAT_VEC2 = 35664;
      var GL_FLOAT_VEC3 = 35665;
      var GL_FLOAT_VEC4 = 35666;
      var GL_INT$3 = 5124;
      var GL_INT_VEC2 = 35667;
      var GL_INT_VEC3 = 35668;
      var GL_INT_VEC4 = 35669;
      var GL_BOOL = 35670;
      var GL_BOOL_VEC2 = 35671;
      var GL_BOOL_VEC3 = 35672;
      var GL_BOOL_VEC4 = 35673;
      var GL_FLOAT_MAT2 = 35674;
      var GL_FLOAT_MAT3 = 35675;
      var GL_FLOAT_MAT4 = 35676;
      var GL_SAMPLER_2D = 35678;
      var GL_SAMPLER_CUBE = 35680;
      var GL_TRIANGLES$1 = 4;
      var GL_FRONT = 1028;
      var GL_BACK = 1029;
      var GL_CW = 2304;
      var GL_CCW = 2305;
      var GL_MIN_EXT = 32775;
      var GL_MAX_EXT = 32776;
      var GL_ALWAYS = 519;
      var GL_KEEP = 7680;
      var GL_ZERO = 0;
      var GL_ONE = 1;
      var GL_FUNC_ADD = 32774;
      var GL_LESS = 513;
      var GL_FRAMEBUFFER$2 = 36160;
      var GL_COLOR_ATTACHMENT0$2 = 36064;
      var blendFuncs = {
        "0": 0,
        "1": 1,
        "zero": 0,
        "one": 1,
        "src color": 768,
        "one minus src color": 769,
        "src alpha": 770,
        "one minus src alpha": 771,
        "dst color": 774,
        "one minus dst color": 775,
        "dst alpha": 772,
        "one minus dst alpha": 773,
        "constant color": 32769,
        "one minus constant color": 32770,
        "constant alpha": 32771,
        "one minus constant alpha": 32772,
        "src alpha saturate": 776
      };
      var invalidBlendCombinations = [
        "constant color, constant alpha",
        "one minus constant color, constant alpha",
        "constant color, one minus constant alpha",
        "one minus constant color, one minus constant alpha",
        "constant alpha, constant color",
        "constant alpha, one minus constant color",
        "one minus constant alpha, constant color",
        "one minus constant alpha, one minus constant color"
      ];
      var compareFuncs = {
        "never": 512,
        "less": 513,
        "<": 513,
        "equal": 514,
        "=": 514,
        "==": 514,
        "===": 514,
        "lequal": 515,
        "<=": 515,
        "greater": 516,
        ">": 516,
        "notequal": 517,
        "!=": 517,
        "!==": 517,
        "gequal": 518,
        ">=": 518,
        "always": 519
      };
      var stencilOps = {
        "0": 0,
        "zero": 0,
        "keep": 7680,
        "replace": 7681,
        "increment": 7682,
        "decrement": 7683,
        "increment wrap": 34055,
        "decrement wrap": 34056,
        "invert": 5386
      };
      var shaderType = {
        "frag": GL_FRAGMENT_SHADER$1,
        "vert": GL_VERTEX_SHADER$1
      };
      var orientationType = {
        "cw": GL_CW,
        "ccw": GL_CCW
      };
      function isBufferArgs(x2) {
        return Array.isArray(x2) || isTypedArray(x2) || isNDArrayLike(x2);
      }
      function sortState(state) {
        return state.sort(function(a, b) {
          if (a === S_VIEWPORT) {
            return -1;
          } else if (b === S_VIEWPORT) {
            return 1;
          }
          return a < b ? -1 : 1;
        });
      }
      function Declaration(thisDep, contextDep, propDep, append2) {
        this.thisDep = thisDep;
        this.contextDep = contextDep;
        this.propDep = propDep;
        this.append = append2;
      }
      function isStatic(decl) {
        return decl && !(decl.thisDep || decl.contextDep || decl.propDep);
      }
      function createStaticDecl(append2) {
        return new Declaration(false, false, false, append2);
      }
      function createDynamicDecl(dyn, append2) {
        var type2 = dyn.type;
        if (type2 === DYN_FUNC$1) {
          var numArgs = dyn.data.length;
          return new Declaration(
            true,
            numArgs >= 1,
            numArgs >= 2,
            append2
          );
        } else if (type2 === DYN_THUNK) {
          var data = dyn.data;
          return new Declaration(
            data.thisDep,
            data.contextDep,
            data.propDep,
            append2
          );
        } else if (type2 === DYN_CONSTANT$1) {
          return new Declaration(
            false,
            false,
            false,
            append2
          );
        } else if (type2 === DYN_ARRAY$1) {
          var thisDep = false;
          var contextDep = false;
          var propDep = false;
          for (var i = 0; i < dyn.data.length; ++i) {
            var subDyn = dyn.data[i];
            if (subDyn.type === DYN_PROP$1) {
              propDep = true;
            } else if (subDyn.type === DYN_CONTEXT$1) {
              contextDep = true;
            } else if (subDyn.type === DYN_STATE$1) {
              thisDep = true;
            } else if (subDyn.type === DYN_FUNC$1) {
              thisDep = true;
              var subArgs = subDyn.data;
              if (subArgs >= 1) {
                contextDep = true;
              }
              if (subArgs >= 2) {
                propDep = true;
              }
            } else if (subDyn.type === DYN_THUNK) {
              thisDep = thisDep || subDyn.data.thisDep;
              contextDep = contextDep || subDyn.data.contextDep;
              propDep = propDep || subDyn.data.propDep;
            }
          }
          return new Declaration(
            thisDep,
            contextDep,
            propDep,
            append2
          );
        } else {
          return new Declaration(
            type2 === DYN_STATE$1,
            type2 === DYN_CONTEXT$1,
            type2 === DYN_PROP$1,
            append2
          );
        }
      }
      var SCOPE_DECL = new Declaration(false, false, false, function() {
      });
      function reglCore(gl, stringStore, extensions, limits, bufferState, elementState, textureState, framebufferState, uniformState, attributeState, shaderState, drawState, contextState, timer2, config) {
        var AttributeRecord2 = attributeState.Record;
        var blendEquations = {
          "add": 32774,
          "subtract": 32778,
          "reverse subtract": 32779
        };
        if (extensions.ext_blend_minmax) {
          blendEquations.min = GL_MIN_EXT;
          blendEquations.max = GL_MAX_EXT;
        }
        var extInstancing = extensions.angle_instanced_arrays;
        var extDrawBuffers = extensions.webgl_draw_buffers;
        var extVertexArrays = extensions.oes_vertex_array_object;
        var currentState = {
          dirty: true,
          profile: config.profile
        };
        var nextState = {};
        var GL_STATE_NAMES = [];
        var GL_FLAGS = {};
        var GL_VARIABLES = {};
        function propName(name) {
          return name.replace(".", "_");
        }
        function stateFlag(sname, cap, init2) {
          var name = propName(sname);
          GL_STATE_NAMES.push(sname);
          nextState[name] = currentState[name] = !!init2;
          GL_FLAGS[name] = cap;
        }
        function stateVariable(sname, func, init2) {
          var name = propName(sname);
          GL_STATE_NAMES.push(sname);
          if (Array.isArray(init2)) {
            currentState[name] = init2.slice();
            nextState[name] = init2.slice();
          } else {
            currentState[name] = nextState[name] = init2;
          }
          GL_VARIABLES[name] = func;
        }
        stateFlag(S_DITHER, GL_DITHER);
        stateFlag(S_BLEND_ENABLE, GL_BLEND);
        stateVariable(S_BLEND_COLOR, "blendColor", [0, 0, 0, 0]);
        stateVariable(
          S_BLEND_EQUATION,
          "blendEquationSeparate",
          [GL_FUNC_ADD, GL_FUNC_ADD]
        );
        stateVariable(
          S_BLEND_FUNC,
          "blendFuncSeparate",
          [GL_ONE, GL_ZERO, GL_ONE, GL_ZERO]
        );
        stateFlag(S_DEPTH_ENABLE, GL_DEPTH_TEST, true);
        stateVariable(S_DEPTH_FUNC, "depthFunc", GL_LESS);
        stateVariable(S_DEPTH_RANGE, "depthRange", [0, 1]);
        stateVariable(S_DEPTH_MASK, "depthMask", true);
        stateVariable(S_COLOR_MASK, S_COLOR_MASK, [true, true, true, true]);
        stateFlag(S_CULL_ENABLE, GL_CULL_FACE);
        stateVariable(S_CULL_FACE, "cullFace", GL_BACK);
        stateVariable(S_FRONT_FACE, S_FRONT_FACE, GL_CCW);
        stateVariable(S_LINE_WIDTH, S_LINE_WIDTH, 1);
        stateFlag(S_POLYGON_OFFSET_ENABLE, GL_POLYGON_OFFSET_FILL);
        stateVariable(S_POLYGON_OFFSET_OFFSET, "polygonOffset", [0, 0]);
        stateFlag(S_SAMPLE_ALPHA, GL_SAMPLE_ALPHA_TO_COVERAGE);
        stateFlag(S_SAMPLE_ENABLE, GL_SAMPLE_COVERAGE);
        stateVariable(S_SAMPLE_COVERAGE, "sampleCoverage", [1, false]);
        stateFlag(S_STENCIL_ENABLE, GL_STENCIL_TEST);
        stateVariable(S_STENCIL_MASK, "stencilMask", -1);
        stateVariable(S_STENCIL_FUNC, "stencilFunc", [GL_ALWAYS, 0, -1]);
        stateVariable(
          S_STENCIL_OPFRONT,
          "stencilOpSeparate",
          [GL_FRONT, GL_KEEP, GL_KEEP, GL_KEEP]
        );
        stateVariable(
          S_STENCIL_OPBACK,
          "stencilOpSeparate",
          [GL_BACK, GL_KEEP, GL_KEEP, GL_KEEP]
        );
        stateFlag(S_SCISSOR_ENABLE, GL_SCISSOR_TEST);
        stateVariable(
          S_SCISSOR_BOX,
          "scissor",
          [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
        );
        stateVariable(
          S_VIEWPORT,
          S_VIEWPORT,
          [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]
        );
        var sharedState = {
          gl,
          context: contextState,
          strings: stringStore,
          next: nextState,
          current: currentState,
          draw: drawState,
          elements: elementState,
          buffer: bufferState,
          shader: shaderState,
          attributes: attributeState.state,
          vao: attributeState,
          uniforms: uniformState,
          framebuffer: framebufferState,
          extensions,
          timer: timer2,
          isBufferArgs
        };
        var sharedConstants = {
          primTypes,
          compareFuncs,
          blendFuncs,
          blendEquations,
          stencilOps,
          glTypes,
          orientationType
        };
        check$1.optional(function() {
          sharedState.isArrayLike = isArrayLike;
        });
        if (extDrawBuffers) {
          sharedConstants.backBuffer = [GL_BACK];
          sharedConstants.drawBuffer = loop(limits.maxDrawbuffers, function(i) {
            if (i === 0) {
              return [0];
            }
            return loop(i, function(j) {
              return GL_COLOR_ATTACHMENT0$2 + j;
            });
          });
        }
        var drawCallCounter = 0;
        function createREGLEnvironment() {
          var env = createEnvironment();
          var link = env.link;
          var global = env.global;
          env.id = drawCallCounter++;
          env.batchId = "0";
          var SHARED = link(sharedState);
          var shared = env.shared = {
            props: "a0"
          };
          Object.keys(sharedState).forEach(function(prop) {
            shared[prop] = global.def(SHARED, ".", prop);
          });
          check$1.optional(function() {
            env.CHECK = link(check$1);
            env.commandStr = check$1.guessCommand();
            env.command = link(env.commandStr);
            env.assert = function(block, pred, message) {
              block(
                "if(!(",
                pred,
                "))",
                this.CHECK,
                ".commandRaise(",
                link(message),
                ",",
                this.command,
                ");"
              );
            };
            sharedConstants.invalidBlendCombinations = invalidBlendCombinations;
          });
          var nextVars = env.next = {};
          var currentVars = env.current = {};
          Object.keys(GL_VARIABLES).forEach(function(variable) {
            if (Array.isArray(currentState[variable])) {
              nextVars[variable] = global.def(shared.next, ".", variable);
              currentVars[variable] = global.def(shared.current, ".", variable);
            }
          });
          var constants2 = env.constants = {};
          Object.keys(sharedConstants).forEach(function(name) {
            constants2[name] = global.def(JSON.stringify(sharedConstants[name]));
          });
          env.invoke = function(block, x2) {
            switch (x2.type) {
              case DYN_FUNC$1:
                var argList = [
                  "this",
                  shared.context,
                  shared.props,
                  env.batchId
                ];
                return block.def(
                  link(x2.data),
                  ".call(",
                  argList.slice(0, Math.max(x2.data.length + 1, 4)),
                  ")"
                );
              case DYN_PROP$1:
                return block.def(shared.props, x2.data);
              case DYN_CONTEXT$1:
                return block.def(shared.context, x2.data);
              case DYN_STATE$1:
                return block.def("this", x2.data);
              case DYN_THUNK:
                x2.data.append(env, block);
                return x2.data.ref;
              case DYN_CONSTANT$1:
                return x2.data.toString();
              case DYN_ARRAY$1:
                return x2.data.map(function(y2) {
                  return env.invoke(block, y2);
                });
            }
          };
          env.attribCache = {};
          var scopeAttribs = {};
          env.scopeAttrib = function(name) {
            var id2 = stringStore.id(name);
            if (id2 in scopeAttribs) {
              return scopeAttribs[id2];
            }
            var binding = attributeState.scope[id2];
            if (!binding) {
              binding = attributeState.scope[id2] = new AttributeRecord2();
            }
            var result = scopeAttribs[id2] = link(binding);
            return result;
          };
          return env;
        }
        function parseProfile(options) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          var profileEnable;
          if (S_PROFILE in staticOptions) {
            var value = !!staticOptions[S_PROFILE];
            profileEnable = createStaticDecl(function(env, scope) {
              return value;
            });
            profileEnable.enable = value;
          } else if (S_PROFILE in dynamicOptions) {
            var dyn = dynamicOptions[S_PROFILE];
            profileEnable = createDynamicDecl(dyn, function(env, scope) {
              return env.invoke(scope, dyn);
            });
          }
          return profileEnable;
        }
        function parseFramebuffer(options, env) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          if (S_FRAMEBUFFER in staticOptions) {
            var framebuffer = staticOptions[S_FRAMEBUFFER];
            if (framebuffer) {
              framebuffer = framebufferState.getFramebuffer(framebuffer);
              check$1.command(framebuffer, "invalid framebuffer object");
              return createStaticDecl(function(env2, block) {
                var FRAMEBUFFER = env2.link(framebuffer);
                var shared = env2.shared;
                block.set(
                  shared.framebuffer,
                  ".next",
                  FRAMEBUFFER
                );
                var CONTEXT = shared.context;
                block.set(
                  CONTEXT,
                  "." + S_FRAMEBUFFER_WIDTH,
                  FRAMEBUFFER + ".width"
                );
                block.set(
                  CONTEXT,
                  "." + S_FRAMEBUFFER_HEIGHT,
                  FRAMEBUFFER + ".height"
                );
                return FRAMEBUFFER;
              });
            } else {
              return createStaticDecl(function(env2, scope) {
                var shared = env2.shared;
                scope.set(
                  shared.framebuffer,
                  ".next",
                  "null"
                );
                var CONTEXT = shared.context;
                scope.set(
                  CONTEXT,
                  "." + S_FRAMEBUFFER_WIDTH,
                  CONTEXT + "." + S_DRAWINGBUFFER_WIDTH
                );
                scope.set(
                  CONTEXT,
                  "." + S_FRAMEBUFFER_HEIGHT,
                  CONTEXT + "." + S_DRAWINGBUFFER_HEIGHT
                );
                return "null";
              });
            }
          } else if (S_FRAMEBUFFER in dynamicOptions) {
            var dyn = dynamicOptions[S_FRAMEBUFFER];
            return createDynamicDecl(dyn, function(env2, scope) {
              var FRAMEBUFFER_FUNC = env2.invoke(scope, dyn);
              var shared = env2.shared;
              var FRAMEBUFFER_STATE = shared.framebuffer;
              var FRAMEBUFFER = scope.def(
                FRAMEBUFFER_STATE,
                ".getFramebuffer(",
                FRAMEBUFFER_FUNC,
                ")"
              );
              check$1.optional(function() {
                env2.assert(
                  scope,
                  "!" + FRAMEBUFFER_FUNC + "||" + FRAMEBUFFER,
                  "invalid framebuffer object"
                );
              });
              scope.set(
                FRAMEBUFFER_STATE,
                ".next",
                FRAMEBUFFER
              );
              var CONTEXT = shared.context;
              scope.set(
                CONTEXT,
                "." + S_FRAMEBUFFER_WIDTH,
                FRAMEBUFFER + "?" + FRAMEBUFFER + ".width:" + CONTEXT + "." + S_DRAWINGBUFFER_WIDTH
              );
              scope.set(
                CONTEXT,
                "." + S_FRAMEBUFFER_HEIGHT,
                FRAMEBUFFER + "?" + FRAMEBUFFER + ".height:" + CONTEXT + "." + S_DRAWINGBUFFER_HEIGHT
              );
              return FRAMEBUFFER;
            });
          } else {
            return null;
          }
        }
        function parseViewportScissor(options, framebuffer, env) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          function parseBox(param) {
            if (param in staticOptions) {
              var box = staticOptions[param];
              check$1.commandType(box, "object", "invalid " + param, env.commandStr);
              var isStatic2 = true;
              var x2 = box.x | 0;
              var y2 = box.y | 0;
              var w, h3;
              if ("width" in box) {
                w = box.width | 0;
                check$1.command(w >= 0, "invalid " + param, env.commandStr);
              } else {
                isStatic2 = false;
              }
              if ("height" in box) {
                h3 = box.height | 0;
                check$1.command(h3 >= 0, "invalid " + param, env.commandStr);
              } else {
                isStatic2 = false;
              }
              return new Declaration(
                !isStatic2 && framebuffer && framebuffer.thisDep,
                !isStatic2 && framebuffer && framebuffer.contextDep,
                !isStatic2 && framebuffer && framebuffer.propDep,
                function(env2, scope) {
                  var CONTEXT = env2.shared.context;
                  var BOX_W = w;
                  if (!("width" in box)) {
                    BOX_W = scope.def(CONTEXT, ".", S_FRAMEBUFFER_WIDTH, "-", x2);
                  }
                  var BOX_H = h3;
                  if (!("height" in box)) {
                    BOX_H = scope.def(CONTEXT, ".", S_FRAMEBUFFER_HEIGHT, "-", y2);
                  }
                  return [x2, y2, BOX_W, BOX_H];
                }
              );
            } else if (param in dynamicOptions) {
              var dynBox = dynamicOptions[param];
              var result = createDynamicDecl(dynBox, function(env2, scope) {
                var BOX = env2.invoke(scope, dynBox);
                check$1.optional(function() {
                  env2.assert(
                    scope,
                    BOX + "&&typeof " + BOX + '==="object"',
                    "invalid " + param
                  );
                });
                var CONTEXT = env2.shared.context;
                var BOX_X = scope.def(BOX, ".x|0");
                var BOX_Y = scope.def(BOX, ".y|0");
                var BOX_W = scope.def(
                  '"width" in ',
                  BOX,
                  "?",
                  BOX,
                  ".width|0:",
                  "(",
                  CONTEXT,
                  ".",
                  S_FRAMEBUFFER_WIDTH,
                  "-",
                  BOX_X,
                  ")"
                );
                var BOX_H = scope.def(
                  '"height" in ',
                  BOX,
                  "?",
                  BOX,
                  ".height|0:",
                  "(",
                  CONTEXT,
                  ".",
                  S_FRAMEBUFFER_HEIGHT,
                  "-",
                  BOX_Y,
                  ")"
                );
                check$1.optional(function() {
                  env2.assert(
                    scope,
                    BOX_W + ">=0&&" + BOX_H + ">=0",
                    "invalid " + param
                  );
                });
                return [BOX_X, BOX_Y, BOX_W, BOX_H];
              });
              if (framebuffer) {
                result.thisDep = result.thisDep || framebuffer.thisDep;
                result.contextDep = result.contextDep || framebuffer.contextDep;
                result.propDep = result.propDep || framebuffer.propDep;
              }
              return result;
            } else if (framebuffer) {
              return new Declaration(
                framebuffer.thisDep,
                framebuffer.contextDep,
                framebuffer.propDep,
                function(env2, scope) {
                  var CONTEXT = env2.shared.context;
                  return [
                    0,
                    0,
                    scope.def(CONTEXT, ".", S_FRAMEBUFFER_WIDTH),
                    scope.def(CONTEXT, ".", S_FRAMEBUFFER_HEIGHT)
                  ];
                }
              );
            } else {
              return null;
            }
          }
          var viewport = parseBox(S_VIEWPORT);
          if (viewport) {
            var prevViewport = viewport;
            viewport = new Declaration(
              viewport.thisDep,
              viewport.contextDep,
              viewport.propDep,
              function(env2, scope) {
                var VIEWPORT = prevViewport.append(env2, scope);
                var CONTEXT = env2.shared.context;
                scope.set(
                  CONTEXT,
                  "." + S_VIEWPORT_WIDTH,
                  VIEWPORT[2]
                );
                scope.set(
                  CONTEXT,
                  "." + S_VIEWPORT_HEIGHT,
                  VIEWPORT[3]
                );
                return VIEWPORT;
              }
            );
          }
          return {
            viewport,
            scissor_box: parseBox(S_SCISSOR_BOX)
          };
        }
        function parseAttribLocations(options, attributes) {
          var staticOptions = options.static;
          var staticProgram = typeof staticOptions[S_FRAG] === "string" && typeof staticOptions[S_VERT] === "string";
          if (staticProgram) {
            if (Object.keys(attributes.dynamic).length > 0) {
              return null;
            }
            var staticAttributes = attributes.static;
            var sAttributes = Object.keys(staticAttributes);
            if (sAttributes.length > 0 && typeof staticAttributes[sAttributes[0]] === "number") {
              var bindings = [];
              for (var i = 0; i < sAttributes.length; ++i) {
                check$1(typeof staticAttributes[sAttributes[i]] === "number", "must specify all vertex attribute locations when using vaos");
                bindings.push([staticAttributes[sAttributes[i]] | 0, sAttributes[i]]);
              }
              return bindings;
            }
          }
          return null;
        }
        function parseProgram(options, env, attribLocations) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          function parseShader(name) {
            if (name in staticOptions) {
              var id2 = stringStore.id(staticOptions[name]);
              check$1.optional(function() {
                shaderState.shader(shaderType[name], id2, check$1.guessCommand());
              });
              var result = createStaticDecl(function() {
                return id2;
              });
              result.id = id2;
              return result;
            } else if (name in dynamicOptions) {
              var dyn = dynamicOptions[name];
              return createDynamicDecl(dyn, function(env2, scope) {
                var str = env2.invoke(scope, dyn);
                var id3 = scope.def(env2.shared.strings, ".id(", str, ")");
                check$1.optional(function() {
                  scope(
                    env2.shared.shader,
                    ".shader(",
                    shaderType[name],
                    ",",
                    id3,
                    ",",
                    env2.command,
                    ");"
                  );
                });
                return id3;
              });
            }
            return null;
          }
          var frag = parseShader(S_FRAG);
          var vert = parseShader(S_VERT);
          var program = null;
          var progVar;
          if (isStatic(frag) && isStatic(vert)) {
            program = shaderState.program(vert.id, frag.id, null, attribLocations);
            progVar = createStaticDecl(function(env2, scope) {
              return env2.link(program);
            });
          } else {
            progVar = new Declaration(
              frag && frag.thisDep || vert && vert.thisDep,
              frag && frag.contextDep || vert && vert.contextDep,
              frag && frag.propDep || vert && vert.propDep,
              function(env2, scope) {
                var SHADER_STATE = env2.shared.shader;
                var fragId;
                if (frag) {
                  fragId = frag.append(env2, scope);
                } else {
                  fragId = scope.def(SHADER_STATE, ".", S_FRAG);
                }
                var vertId;
                if (vert) {
                  vertId = vert.append(env2, scope);
                } else {
                  vertId = scope.def(SHADER_STATE, ".", S_VERT);
                }
                var progDef = SHADER_STATE + ".program(" + vertId + "," + fragId;
                check$1.optional(function() {
                  progDef += "," + env2.command;
                });
                return scope.def(progDef + ")");
              }
            );
          }
          return {
            frag,
            vert,
            progVar,
            program
          };
        }
        function parseDraw(options, env) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          var staticDraw = {};
          var vaoActive = false;
          function parseVAO() {
            if (S_VAO in staticOptions) {
              var vao2 = staticOptions[S_VAO];
              if (vao2 !== null && attributeState.getVAO(vao2) === null) {
                vao2 = attributeState.createVAO(vao2);
              }
              vaoActive = true;
              staticDraw.vao = vao2;
              return createStaticDecl(function(env2) {
                var vaoRef = attributeState.getVAO(vao2);
                if (vaoRef) {
                  return env2.link(vaoRef);
                } else {
                  return "null";
                }
              });
            } else if (S_VAO in dynamicOptions) {
              vaoActive = true;
              var dyn = dynamicOptions[S_VAO];
              return createDynamicDecl(dyn, function(env2, scope) {
                var vaoRef = env2.invoke(scope, dyn);
                return scope.def(env2.shared.vao + ".getVAO(" + vaoRef + ")");
              });
            }
            return null;
          }
          var vao = parseVAO();
          var elementsActive = false;
          function parseElements() {
            if (S_ELEMENTS in staticOptions) {
              var elements2 = staticOptions[S_ELEMENTS];
              staticDraw.elements = elements2;
              if (isBufferArgs(elements2)) {
                var e = staticDraw.elements = elementState.create(elements2, true);
                elements2 = elementState.getElements(e);
                elementsActive = true;
              } else if (elements2) {
                elements2 = elementState.getElements(elements2);
                elementsActive = true;
                check$1.command(elements2, "invalid elements", env.commandStr);
              }
              var result = createStaticDecl(function(env2, scope) {
                if (elements2) {
                  var result2 = env2.link(elements2);
                  env2.ELEMENTS = result2;
                  return result2;
                }
                env2.ELEMENTS = null;
                return null;
              });
              result.value = elements2;
              return result;
            } else if (S_ELEMENTS in dynamicOptions) {
              elementsActive = true;
              var dyn = dynamicOptions[S_ELEMENTS];
              return createDynamicDecl(dyn, function(env2, scope) {
                var shared = env2.shared;
                var IS_BUFFER_ARGS = shared.isBufferArgs;
                var ELEMENT_STATE = shared.elements;
                var elementDefn = env2.invoke(scope, dyn);
                var elements3 = scope.def("null");
                var elementStream = scope.def(IS_BUFFER_ARGS, "(", elementDefn, ")");
                var ifte = env2.cond(elementStream).then(elements3, "=", ELEMENT_STATE, ".createStream(", elementDefn, ");").else(elements3, "=", ELEMENT_STATE, ".getElements(", elementDefn, ");");
                check$1.optional(function() {
                  env2.assert(
                    ifte.else,
                    "!" + elementDefn + "||" + elements3,
                    "invalid elements"
                  );
                });
                scope.entry(ifte);
                scope.exit(
                  env2.cond(elementStream).then(ELEMENT_STATE, ".destroyStream(", elements3, ");")
                );
                env2.ELEMENTS = elements3;
                return elements3;
              });
            } else if (vaoActive) {
              return new Declaration(
                vao.thisDep,
                vao.contextDep,
                vao.propDep,
                function(env2, scope) {
                  return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.elements + ".getElements(" + env2.shared.vao + ".currentVAO.elements):null");
                }
              );
            }
            return null;
          }
          var elements = parseElements();
          function parsePrimitive() {
            if (S_PRIMITIVE in staticOptions) {
              var primitive2 = staticOptions[S_PRIMITIVE];
              staticDraw.primitive = primitive2;
              check$1.commandParameter(primitive2, primTypes, "invalid primitve", env.commandStr);
              return createStaticDecl(function(env2, scope) {
                return primTypes[primitive2];
              });
            } else if (S_PRIMITIVE in dynamicOptions) {
              var dynPrimitive = dynamicOptions[S_PRIMITIVE];
              return createDynamicDecl(dynPrimitive, function(env2, scope) {
                var PRIM_TYPES = env2.constants.primTypes;
                var prim = env2.invoke(scope, dynPrimitive);
                check$1.optional(function() {
                  env2.assert(
                    scope,
                    prim + " in " + PRIM_TYPES,
                    "invalid primitive, must be one of " + Object.keys(primTypes)
                  );
                });
                return scope.def(PRIM_TYPES, "[", prim, "]");
              });
            } else if (elementsActive) {
              if (isStatic(elements)) {
                if (elements.value) {
                  return createStaticDecl(function(env2, scope) {
                    return scope.def(env2.ELEMENTS, ".primType");
                  });
                } else {
                  return createStaticDecl(function() {
                    return GL_TRIANGLES$1;
                  });
                }
              } else {
                return new Declaration(
                  elements.thisDep,
                  elements.contextDep,
                  elements.propDep,
                  function(env2, scope) {
                    var elements2 = env2.ELEMENTS;
                    return scope.def(elements2, "?", elements2, ".primType:", GL_TRIANGLES$1);
                  }
                );
              }
            } else if (vaoActive) {
              return new Declaration(
                vao.thisDep,
                vao.contextDep,
                vao.propDep,
                function(env2, scope) {
                  return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.vao + ".currentVAO.primitive:" + GL_TRIANGLES$1);
                }
              );
            }
            return null;
          }
          function parseParam(param, isOffset) {
            if (param in staticOptions) {
              var value = staticOptions[param] | 0;
              if (isOffset) {
                staticDraw.offset = value;
              } else {
                staticDraw.instances = value;
              }
              check$1.command(!isOffset || value >= 0, "invalid " + param, env.commandStr);
              return createStaticDecl(function(env2, scope) {
                if (isOffset) {
                  env2.OFFSET = value;
                }
                return value;
              });
            } else if (param in dynamicOptions) {
              var dynValue = dynamicOptions[param];
              return createDynamicDecl(dynValue, function(env2, scope) {
                var result = env2.invoke(scope, dynValue);
                if (isOffset) {
                  env2.OFFSET = result;
                  check$1.optional(function() {
                    env2.assert(
                      scope,
                      result + ">=0",
                      "invalid " + param
                    );
                  });
                }
                return result;
              });
            } else if (isOffset) {
              if (elementsActive) {
                return createStaticDecl(function(env2, scope) {
                  env2.OFFSET = 0;
                  return 0;
                });
              } else if (vaoActive) {
                return new Declaration(
                  vao.thisDep,
                  vao.contextDep,
                  vao.propDep,
                  function(env2, scope) {
                    return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.vao + ".currentVAO.offset:0");
                  }
                );
              }
            } else if (vaoActive) {
              return new Declaration(
                vao.thisDep,
                vao.contextDep,
                vao.propDep,
                function(env2, scope) {
                  return scope.def(env2.shared.vao + ".currentVAO?" + env2.shared.vao + ".currentVAO.instances:-1");
                }
              );
            }
            return null;
          }
          var OFFSET = parseParam(S_OFFSET, true);
          function parseVertCount() {
            if (S_COUNT in staticOptions) {
              var count2 = staticOptions[S_COUNT] | 0;
              staticDraw.count = count2;
              check$1.command(
                typeof count2 === "number" && count2 >= 0,
                "invalid vertex count",
                env.commandStr
              );
              return createStaticDecl(function() {
                return count2;
              });
            } else if (S_COUNT in dynamicOptions) {
              var dynCount = dynamicOptions[S_COUNT];
              return createDynamicDecl(dynCount, function(env2, scope) {
                var result2 = env2.invoke(scope, dynCount);
                check$1.optional(function() {
                  env2.assert(
                    scope,
                    "typeof " + result2 + '==="number"&&' + result2 + ">=0&&" + result2 + "===(" + result2 + "|0)",
                    "invalid vertex count"
                  );
                });
                return result2;
              });
            } else if (elementsActive) {
              if (isStatic(elements)) {
                if (elements) {
                  if (OFFSET) {
                    return new Declaration(
                      OFFSET.thisDep,
                      OFFSET.contextDep,
                      OFFSET.propDep,
                      function(env2, scope) {
                        var result2 = scope.def(
                          env2.ELEMENTS,
                          ".vertCount-",
                          env2.OFFSET
                        );
                        check$1.optional(function() {
                          env2.assert(
                            scope,
                            result2 + ">=0",
                            "invalid vertex offset/element buffer too small"
                          );
                        });
                        return result2;
                      }
                    );
                  } else {
                    return createStaticDecl(function(env2, scope) {
                      return scope.def(env2.ELEMENTS, ".vertCount");
                    });
                  }
                } else {
                  var result = createStaticDecl(function() {
                    return -1;
                  });
                  check$1.optional(function() {
                    result.MISSING = true;
                  });
                  return result;
                }
              } else {
                var variable = new Declaration(
                  elements.thisDep || OFFSET.thisDep,
                  elements.contextDep || OFFSET.contextDep,
                  elements.propDep || OFFSET.propDep,
                  function(env2, scope) {
                    var elements2 = env2.ELEMENTS;
                    if (env2.OFFSET) {
                      return scope.def(
                        elements2,
                        "?",
                        elements2,
                        ".vertCount-",
                        env2.OFFSET,
                        ":-1"
                      );
                    }
                    return scope.def(elements2, "?", elements2, ".vertCount:-1");
                  }
                );
                check$1.optional(function() {
                  variable.DYNAMIC = true;
                });
                return variable;
              }
            } else if (vaoActive) {
              var countVariable = new Declaration(
                vao.thisDep,
                vao.contextDep,
                vao.propDep,
                function(env2, scope) {
                  return scope.def(env2.shared.vao, ".currentVAO?", env2.shared.vao, ".currentVAO.count:-1");
                }
              );
              return countVariable;
            }
            return null;
          }
          var primitive = parsePrimitive();
          var count = parseVertCount();
          var instances = parseParam(S_INSTANCES, false);
          return {
            elements,
            primitive,
            count,
            instances,
            offset: OFFSET,
            vao,
            vaoActive,
            elementsActive,
            // static draw props
            static: staticDraw
          };
        }
        function parseGLState(options, env) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          var STATE = {};
          GL_STATE_NAMES.forEach(function(prop) {
            var param = propName(prop);
            function parseParam(parseStatic, parseDynamic) {
              if (prop in staticOptions) {
                var value = parseStatic(staticOptions[prop]);
                STATE[param] = createStaticDecl(function() {
                  return value;
                });
              } else if (prop in dynamicOptions) {
                var dyn = dynamicOptions[prop];
                STATE[param] = createDynamicDecl(dyn, function(env2, scope) {
                  return parseDynamic(env2, scope, env2.invoke(scope, dyn));
                });
              }
            }
            switch (prop) {
              case S_CULL_ENABLE:
              case S_BLEND_ENABLE:
              case S_DITHER:
              case S_STENCIL_ENABLE:
              case S_DEPTH_ENABLE:
              case S_SCISSOR_ENABLE:
              case S_POLYGON_OFFSET_ENABLE:
              case S_SAMPLE_ALPHA:
              case S_SAMPLE_ENABLE:
              case S_DEPTH_MASK:
                return parseParam(
                  function(value) {
                    check$1.commandType(value, "boolean", prop, env.commandStr);
                    return value;
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        "typeof " + value + '==="boolean"',
                        "invalid flag " + prop,
                        env2.commandStr
                      );
                    });
                    return value;
                  }
                );
              case S_DEPTH_FUNC:
                return parseParam(
                  function(value) {
                    check$1.commandParameter(value, compareFuncs, "invalid " + prop, env.commandStr);
                    return compareFuncs[value];
                  },
                  function(env2, scope, value) {
                    var COMPARE_FUNCS = env2.constants.compareFuncs;
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + " in " + COMPARE_FUNCS,
                        "invalid " + prop + ", must be one of " + Object.keys(compareFuncs)
                      );
                    });
                    return scope.def(COMPARE_FUNCS, "[", value, "]");
                  }
                );
              case S_DEPTH_RANGE:
                return parseParam(
                  function(value) {
                    check$1.command(
                      isArrayLike(value) && value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number" && value[0] <= value[1],
                      "depth range is 2d array",
                      env.commandStr
                    );
                    return value;
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        env2.shared.isArrayLike + "(" + value + ")&&" + value + ".length===2&&typeof " + value + '[0]==="number"&&typeof ' + value + '[1]==="number"&&' + value + "[0]<=" + value + "[1]",
                        "depth range must be a 2d array"
                      );
                    });
                    var Z_NEAR = scope.def("+", value, "[0]");
                    var Z_FAR = scope.def("+", value, "[1]");
                    return [Z_NEAR, Z_FAR];
                  }
                );
              case S_BLEND_FUNC:
                return parseParam(
                  function(value) {
                    check$1.commandType(value, "object", "blend.func", env.commandStr);
                    var srcRGB = "srcRGB" in value ? value.srcRGB : value.src;
                    var srcAlpha = "srcAlpha" in value ? value.srcAlpha : value.src;
                    var dstRGB = "dstRGB" in value ? value.dstRGB : value.dst;
                    var dstAlpha = "dstAlpha" in value ? value.dstAlpha : value.dst;
                    check$1.commandParameter(srcRGB, blendFuncs, param + ".srcRGB", env.commandStr);
                    check$1.commandParameter(srcAlpha, blendFuncs, param + ".srcAlpha", env.commandStr);
                    check$1.commandParameter(dstRGB, blendFuncs, param + ".dstRGB", env.commandStr);
                    check$1.commandParameter(dstAlpha, blendFuncs, param + ".dstAlpha", env.commandStr);
                    check$1.command(
                      invalidBlendCombinations.indexOf(srcRGB + ", " + dstRGB) === -1,
                      "unallowed blending combination (srcRGB, dstRGB) = (" + srcRGB + ", " + dstRGB + ")",
                      env.commandStr
                    );
                    return [
                      blendFuncs[srcRGB],
                      blendFuncs[dstRGB],
                      blendFuncs[srcAlpha],
                      blendFuncs[dstAlpha]
                    ];
                  },
                  function(env2, scope, value) {
                    var BLEND_FUNCS = env2.constants.blendFuncs;
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + "&&typeof " + value + '==="object"',
                        "invalid blend func, must be an object"
                      );
                    });
                    function read(prefix, suffix) {
                      var func = scope.def(
                        '"',
                        prefix,
                        suffix,
                        '" in ',
                        value,
                        "?",
                        value,
                        ".",
                        prefix,
                        suffix,
                        ":",
                        value,
                        ".",
                        prefix
                      );
                      check$1.optional(function() {
                        env2.assert(
                          scope,
                          func + " in " + BLEND_FUNCS,
                          "invalid " + prop + "." + prefix + suffix + ", must be one of " + Object.keys(blendFuncs)
                        );
                      });
                      return func;
                    }
                    var srcRGB = read("src", "RGB");
                    var dstRGB = read("dst", "RGB");
                    check$1.optional(function() {
                      var INVALID_BLEND_COMBINATIONS = env2.constants.invalidBlendCombinations;
                      env2.assert(
                        scope,
                        INVALID_BLEND_COMBINATIONS + ".indexOf(" + srcRGB + '+", "+' + dstRGB + ") === -1 ",
                        "unallowed blending combination for (srcRGB, dstRGB)"
                      );
                    });
                    var SRC_RGB = scope.def(BLEND_FUNCS, "[", srcRGB, "]");
                    var SRC_ALPHA = scope.def(BLEND_FUNCS, "[", read("src", "Alpha"), "]");
                    var DST_RGB = scope.def(BLEND_FUNCS, "[", dstRGB, "]");
                    var DST_ALPHA = scope.def(BLEND_FUNCS, "[", read("dst", "Alpha"), "]");
                    return [SRC_RGB, DST_RGB, SRC_ALPHA, DST_ALPHA];
                  }
                );
              case S_BLEND_EQUATION:
                return parseParam(
                  function(value) {
                    if (typeof value === "string") {
                      check$1.commandParameter(value, blendEquations, "invalid " + prop, env.commandStr);
                      return [
                        blendEquations[value],
                        blendEquations[value]
                      ];
                    } else if (typeof value === "object") {
                      check$1.commandParameter(
                        value.rgb,
                        blendEquations,
                        prop + ".rgb",
                        env.commandStr
                      );
                      check$1.commandParameter(
                        value.alpha,
                        blendEquations,
                        prop + ".alpha",
                        env.commandStr
                      );
                      return [
                        blendEquations[value.rgb],
                        blendEquations[value.alpha]
                      ];
                    } else {
                      check$1.commandRaise("invalid blend.equation", env.commandStr);
                    }
                  },
                  function(env2, scope, value) {
                    var BLEND_EQUATIONS = env2.constants.blendEquations;
                    var RGB = scope.def();
                    var ALPHA = scope.def();
                    var ifte = env2.cond("typeof ", value, '==="string"');
                    check$1.optional(function() {
                      function checkProp(block, name, value2) {
                        env2.assert(
                          block,
                          value2 + " in " + BLEND_EQUATIONS,
                          "invalid " + name + ", must be one of " + Object.keys(blendEquations)
                        );
                      }
                      checkProp(ifte.then, prop, value);
                      env2.assert(
                        ifte.else,
                        value + "&&typeof " + value + '==="object"',
                        "invalid " + prop
                      );
                      checkProp(ifte.else, prop + ".rgb", value + ".rgb");
                      checkProp(ifte.else, prop + ".alpha", value + ".alpha");
                    });
                    ifte.then(
                      RGB,
                      "=",
                      ALPHA,
                      "=",
                      BLEND_EQUATIONS,
                      "[",
                      value,
                      "];"
                    );
                    ifte.else(
                      RGB,
                      "=",
                      BLEND_EQUATIONS,
                      "[",
                      value,
                      ".rgb];",
                      ALPHA,
                      "=",
                      BLEND_EQUATIONS,
                      "[",
                      value,
                      ".alpha];"
                    );
                    scope(ifte);
                    return [RGB, ALPHA];
                  }
                );
              case S_BLEND_COLOR:
                return parseParam(
                  function(value) {
                    check$1.command(
                      isArrayLike(value) && value.length === 4,
                      "blend.color must be a 4d array",
                      env.commandStr
                    );
                    return loop(4, function(i) {
                      return +value[i];
                    });
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        env2.shared.isArrayLike + "(" + value + ")&&" + value + ".length===4",
                        "blend.color must be a 4d array"
                      );
                    });
                    return loop(4, function(i) {
                      return scope.def("+", value, "[", i, "]");
                    });
                  }
                );
              case S_STENCIL_MASK:
                return parseParam(
                  function(value) {
                    check$1.commandType(value, "number", param, env.commandStr);
                    return value | 0;
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        "typeof " + value + '==="number"',
                        "invalid stencil.mask"
                      );
                    });
                    return scope.def(value, "|0");
                  }
                );
              case S_STENCIL_FUNC:
                return parseParam(
                  function(value) {
                    check$1.commandType(value, "object", param, env.commandStr);
                    var cmp = value.cmp || "keep";
                    var ref = value.ref || 0;
                    var mask = "mask" in value ? value.mask : -1;
                    check$1.commandParameter(cmp, compareFuncs, prop + ".cmp", env.commandStr);
                    check$1.commandType(ref, "number", prop + ".ref", env.commandStr);
                    check$1.commandType(mask, "number", prop + ".mask", env.commandStr);
                    return [
                      compareFuncs[cmp],
                      ref,
                      mask
                    ];
                  },
                  function(env2, scope, value) {
                    var COMPARE_FUNCS = env2.constants.compareFuncs;
                    check$1.optional(function() {
                      function assert() {
                        env2.assert(
                          scope,
                          Array.prototype.join.call(arguments, ""),
                          "invalid stencil.func"
                        );
                      }
                      assert(value + "&&typeof ", value, '==="object"');
                      assert(
                        '!("cmp" in ',
                        value,
                        ")||(",
                        value,
                        ".cmp in ",
                        COMPARE_FUNCS,
                        ")"
                      );
                    });
                    var cmp = scope.def(
                      '"cmp" in ',
                      value,
                      "?",
                      COMPARE_FUNCS,
                      "[",
                      value,
                      ".cmp]",
                      ":",
                      GL_KEEP
                    );
                    var ref = scope.def(value, ".ref|0");
                    var mask = scope.def(
                      '"mask" in ',
                      value,
                      "?",
                      value,
                      ".mask|0:-1"
                    );
                    return [cmp, ref, mask];
                  }
                );
              case S_STENCIL_OPFRONT:
              case S_STENCIL_OPBACK:
                return parseParam(
                  function(value) {
                    check$1.commandType(value, "object", param, env.commandStr);
                    var fail = value.fail || "keep";
                    var zfail = value.zfail || "keep";
                    var zpass = value.zpass || "keep";
                    check$1.commandParameter(fail, stencilOps, prop + ".fail", env.commandStr);
                    check$1.commandParameter(zfail, stencilOps, prop + ".zfail", env.commandStr);
                    check$1.commandParameter(zpass, stencilOps, prop + ".zpass", env.commandStr);
                    return [
                      prop === S_STENCIL_OPBACK ? GL_BACK : GL_FRONT,
                      stencilOps[fail],
                      stencilOps[zfail],
                      stencilOps[zpass]
                    ];
                  },
                  function(env2, scope, value) {
                    var STENCIL_OPS = env2.constants.stencilOps;
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + "&&typeof " + value + '==="object"',
                        "invalid " + prop
                      );
                    });
                    function read(name) {
                      check$1.optional(function() {
                        env2.assert(
                          scope,
                          '!("' + name + '" in ' + value + ")||(" + value + "." + name + " in " + STENCIL_OPS + ")",
                          "invalid " + prop + "." + name + ", must be one of " + Object.keys(stencilOps)
                        );
                      });
                      return scope.def(
                        '"',
                        name,
                        '" in ',
                        value,
                        "?",
                        STENCIL_OPS,
                        "[",
                        value,
                        ".",
                        name,
                        "]:",
                        GL_KEEP
                      );
                    }
                    return [
                      prop === S_STENCIL_OPBACK ? GL_BACK : GL_FRONT,
                      read("fail"),
                      read("zfail"),
                      read("zpass")
                    ];
                  }
                );
              case S_POLYGON_OFFSET_OFFSET:
                return parseParam(
                  function(value) {
                    check$1.commandType(value, "object", param, env.commandStr);
                    var factor = value.factor | 0;
                    var units = value.units | 0;
                    check$1.commandType(factor, "number", param + ".factor", env.commandStr);
                    check$1.commandType(units, "number", param + ".units", env.commandStr);
                    return [factor, units];
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + "&&typeof " + value + '==="object"',
                        "invalid " + prop
                      );
                    });
                    var FACTOR = scope.def(value, ".factor|0");
                    var UNITS = scope.def(value, ".units|0");
                    return [FACTOR, UNITS];
                  }
                );
              case S_CULL_FACE:
                return parseParam(
                  function(value) {
                    var face = 0;
                    if (value === "front") {
                      face = GL_FRONT;
                    } else if (value === "back") {
                      face = GL_BACK;
                    }
                    check$1.command(!!face, param, env.commandStr);
                    return face;
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + '==="front"||' + value + '==="back"',
                        "invalid cull.face"
                      );
                    });
                    return scope.def(value, '==="front"?', GL_FRONT, ":", GL_BACK);
                  }
                );
              case S_LINE_WIDTH:
                return parseParam(
                  function(value) {
                    check$1.command(
                      typeof value === "number" && value >= limits.lineWidthDims[0] && value <= limits.lineWidthDims[1],
                      "invalid line width, must be a positive number between " + limits.lineWidthDims[0] + " and " + limits.lineWidthDims[1],
                      env.commandStr
                    );
                    return value;
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        "typeof " + value + '==="number"&&' + value + ">=" + limits.lineWidthDims[0] + "&&" + value + "<=" + limits.lineWidthDims[1],
                        "invalid line width"
                      );
                    });
                    return value;
                  }
                );
              case S_FRONT_FACE:
                return parseParam(
                  function(value) {
                    check$1.commandParameter(value, orientationType, param, env.commandStr);
                    return orientationType[value];
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + '==="cw"||' + value + '==="ccw"',
                        "invalid frontFace, must be one of cw,ccw"
                      );
                    });
                    return scope.def(value + '==="cw"?' + GL_CW + ":" + GL_CCW);
                  }
                );
              case S_COLOR_MASK:
                return parseParam(
                  function(value) {
                    check$1.command(
                      isArrayLike(value) && value.length === 4,
                      "color.mask must be length 4 array",
                      env.commandStr
                    );
                    return value.map(function(v) {
                      return !!v;
                    });
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        env2.shared.isArrayLike + "(" + value + ")&&" + value + ".length===4",
                        "invalid color.mask"
                      );
                    });
                    return loop(4, function(i) {
                      return "!!" + value + "[" + i + "]";
                    });
                  }
                );
              case S_SAMPLE_COVERAGE:
                return parseParam(
                  function(value) {
                    check$1.command(typeof value === "object" && value, param, env.commandStr);
                    var sampleValue = "value" in value ? value.value : 1;
                    var sampleInvert = !!value.invert;
                    check$1.command(
                      typeof sampleValue === "number" && sampleValue >= 0 && sampleValue <= 1,
                      "sample.coverage.value must be a number between 0 and 1",
                      env.commandStr
                    );
                    return [sampleValue, sampleInvert];
                  },
                  function(env2, scope, value) {
                    check$1.optional(function() {
                      env2.assert(
                        scope,
                        value + "&&typeof " + value + '==="object"',
                        "invalid sample.coverage"
                      );
                    });
                    var VALUE = scope.def(
                      '"value" in ',
                      value,
                      "?+",
                      value,
                      ".value:1"
                    );
                    var INVERT = scope.def("!!", value, ".invert");
                    return [VALUE, INVERT];
                  }
                );
            }
          });
          return STATE;
        }
        function parseUniforms(uniforms, env) {
          var staticUniforms = uniforms.static;
          var dynamicUniforms = uniforms.dynamic;
          var UNIFORMS = {};
          Object.keys(staticUniforms).forEach(function(name) {
            var value = staticUniforms[name];
            var result;
            if (typeof value === "number" || typeof value === "boolean") {
              result = createStaticDecl(function() {
                return value;
              });
            } else if (typeof value === "function") {
              var reglType = value._reglType;
              if (reglType === "texture2d" || reglType === "textureCube") {
                result = createStaticDecl(function(env2) {
                  return env2.link(value);
                });
              } else if (reglType === "framebuffer" || reglType === "framebufferCube") {
                check$1.command(
                  value.color.length > 0,
                  'missing color attachment for framebuffer sent to uniform "' + name + '"',
                  env.commandStr
                );
                result = createStaticDecl(function(env2) {
                  return env2.link(value.color[0]);
                });
              } else {
                check$1.commandRaise('invalid data for uniform "' + name + '"', env.commandStr);
              }
            } else if (isArrayLike(value)) {
              result = createStaticDecl(function(env2) {
                var ITEM = env2.global.def(
                  "[",
                  loop(value.length, function(i) {
                    check$1.command(
                      typeof value[i] === "number" || typeof value[i] === "boolean",
                      "invalid uniform " + name,
                      env2.commandStr
                    );
                    return value[i];
                  }),
                  "]"
                );
                return ITEM;
              });
            } else {
              check$1.commandRaise('invalid or missing data for uniform "' + name + '"', env.commandStr);
            }
            result.value = value;
            UNIFORMS[name] = result;
          });
          Object.keys(dynamicUniforms).forEach(function(key) {
            var dyn = dynamicUniforms[key];
            UNIFORMS[key] = createDynamicDecl(dyn, function(env2, scope) {
              return env2.invoke(scope, dyn);
            });
          });
          return UNIFORMS;
        }
        function parseAttributes(attributes, env) {
          var staticAttributes = attributes.static;
          var dynamicAttributes = attributes.dynamic;
          var attributeDefs = {};
          Object.keys(staticAttributes).forEach(function(attribute) {
            var value = staticAttributes[attribute];
            var id2 = stringStore.id(attribute);
            var record = new AttributeRecord2();
            if (isBufferArgs(value)) {
              record.state = ATTRIB_STATE_POINTER;
              record.buffer = bufferState.getBuffer(
                bufferState.create(value, GL_ARRAY_BUFFER$2, false, true)
              );
              record.type = 0;
            } else {
              var buffer = bufferState.getBuffer(value);
              if (buffer) {
                record.state = ATTRIB_STATE_POINTER;
                record.buffer = buffer;
                record.type = 0;
              } else {
                check$1.command(
                  typeof value === "object" && value,
                  "invalid data for attribute " + attribute,
                  env.commandStr
                );
                if ("constant" in value) {
                  var constant = value.constant;
                  record.buffer = "null";
                  record.state = ATTRIB_STATE_CONSTANT;
                  if (typeof constant === "number") {
                    record.x = constant;
                  } else {
                    check$1.command(
                      isArrayLike(constant) && constant.length > 0 && constant.length <= 4,
                      "invalid constant for attribute " + attribute,
                      env.commandStr
                    );
                    CUTE_COMPONENTS.forEach(function(c, i) {
                      if (i < constant.length) {
                        record[c] = constant[i];
                      }
                    });
                  }
                } else {
                  if (isBufferArgs(value.buffer)) {
                    buffer = bufferState.getBuffer(
                      bufferState.create(value.buffer, GL_ARRAY_BUFFER$2, false, true)
                    );
                  } else {
                    buffer = bufferState.getBuffer(value.buffer);
                  }
                  check$1.command(!!buffer, 'missing buffer for attribute "' + attribute + '"', env.commandStr);
                  var offset = value.offset | 0;
                  check$1.command(
                    offset >= 0,
                    'invalid offset for attribute "' + attribute + '"',
                    env.commandStr
                  );
                  var stride = value.stride | 0;
                  check$1.command(
                    stride >= 0 && stride < 256,
                    'invalid stride for attribute "' + attribute + '", must be integer betweeen [0, 255]',
                    env.commandStr
                  );
                  var size = value.size | 0;
                  check$1.command(
                    !("size" in value) || size > 0 && size <= 4,
                    'invalid size for attribute "' + attribute + '", must be 1,2,3,4',
                    env.commandStr
                  );
                  var normalized = !!value.normalized;
                  var type2 = 0;
                  if ("type" in value) {
                    check$1.commandParameter(
                      value.type,
                      glTypes,
                      "invalid type for attribute " + attribute,
                      env.commandStr
                    );
                    type2 = glTypes[value.type];
                  }
                  var divisor = value.divisor | 0;
                  check$1.optional(function() {
                    if ("divisor" in value) {
                      check$1.command(
                        divisor === 0 || extInstancing,
                        'cannot specify divisor for attribute "' + attribute + '", instancing not supported',
                        env.commandStr
                      );
                      check$1.command(
                        divisor >= 0,
                        'invalid divisor for attribute "' + attribute + '"',
                        env.commandStr
                      );
                    }
                    var command = env.commandStr;
                    var VALID_KEYS = [
                      "buffer",
                      "offset",
                      "divisor",
                      "normalized",
                      "type",
                      "size",
                      "stride"
                    ];
                    Object.keys(value).forEach(function(prop) {
                      check$1.command(
                        VALID_KEYS.indexOf(prop) >= 0,
                        'unknown parameter "' + prop + '" for attribute pointer "' + attribute + '" (valid parameters are ' + VALID_KEYS + ")",
                        command
                      );
                    });
                  });
                  record.buffer = buffer;
                  record.state = ATTRIB_STATE_POINTER;
                  record.size = size;
                  record.normalized = normalized;
                  record.type = type2 || buffer.dtype;
                  record.offset = offset;
                  record.stride = stride;
                  record.divisor = divisor;
                }
              }
            }
            attributeDefs[attribute] = createStaticDecl(function(env2, scope) {
              var cache = env2.attribCache;
              if (id2 in cache) {
                return cache[id2];
              }
              var result = {
                isStream: false
              };
              Object.keys(record).forEach(function(key) {
                result[key] = record[key];
              });
              if (record.buffer) {
                result.buffer = env2.link(record.buffer);
                result.type = result.type || result.buffer + ".dtype";
              }
              cache[id2] = result;
              return result;
            });
          });
          Object.keys(dynamicAttributes).forEach(function(attribute) {
            var dyn = dynamicAttributes[attribute];
            function appendAttributeCode(env2, block) {
              var VALUE = env2.invoke(block, dyn);
              var shared = env2.shared;
              var constants2 = env2.constants;
              var IS_BUFFER_ARGS = shared.isBufferArgs;
              var BUFFER_STATE = shared.buffer;
              check$1.optional(function() {
                env2.assert(
                  block,
                  VALUE + "&&(typeof " + VALUE + '==="object"||typeof ' + VALUE + '==="function")&&(' + IS_BUFFER_ARGS + "(" + VALUE + ")||" + BUFFER_STATE + ".getBuffer(" + VALUE + ")||" + BUFFER_STATE + ".getBuffer(" + VALUE + ".buffer)||" + IS_BUFFER_ARGS + "(" + VALUE + '.buffer)||("constant" in ' + VALUE + "&&(typeof " + VALUE + '.constant==="number"||' + shared.isArrayLike + "(" + VALUE + ".constant))))",
                  'invalid dynamic attribute "' + attribute + '"'
                );
              });
              var result = {
                isStream: block.def(false)
              };
              var defaultRecord = new AttributeRecord2();
              defaultRecord.state = ATTRIB_STATE_POINTER;
              Object.keys(defaultRecord).forEach(function(key) {
                result[key] = block.def("" + defaultRecord[key]);
              });
              var BUFFER = result.buffer;
              var TYPE = result.type;
              block(
                "if(",
                IS_BUFFER_ARGS,
                "(",
                VALUE,
                ")){",
                result.isStream,
                "=true;",
                BUFFER,
                "=",
                BUFFER_STATE,
                ".createStream(",
                GL_ARRAY_BUFFER$2,
                ",",
                VALUE,
                ");",
                TYPE,
                "=",
                BUFFER,
                ".dtype;",
                "}else{",
                BUFFER,
                "=",
                BUFFER_STATE,
                ".getBuffer(",
                VALUE,
                ");",
                "if(",
                BUFFER,
                "){",
                TYPE,
                "=",
                BUFFER,
                ".dtype;",
                '}else if("constant" in ',
                VALUE,
                "){",
                result.state,
                "=",
                ATTRIB_STATE_CONSTANT,
                ";",
                "if(typeof " + VALUE + '.constant === "number"){',
                result[CUTE_COMPONENTS[0]],
                "=",
                VALUE,
                ".constant;",
                CUTE_COMPONENTS.slice(1).map(function(n) {
                  return result[n];
                }).join("="),
                "=0;",
                "}else{",
                CUTE_COMPONENTS.map(function(name, i) {
                  return result[name] + "=" + VALUE + ".constant.length>" + i + "?" + VALUE + ".constant[" + i + "]:0;";
                }).join(""),
                "}}else{",
                "if(",
                IS_BUFFER_ARGS,
                "(",
                VALUE,
                ".buffer)){",
                BUFFER,
                "=",
                BUFFER_STATE,
                ".createStream(",
                GL_ARRAY_BUFFER$2,
                ",",
                VALUE,
                ".buffer);",
                "}else{",
                BUFFER,
                "=",
                BUFFER_STATE,
                ".getBuffer(",
                VALUE,
                ".buffer);",
                "}",
                TYPE,
                '="type" in ',
                VALUE,
                "?",
                constants2.glTypes,
                "[",
                VALUE,
                ".type]:",
                BUFFER,
                ".dtype;",
                result.normalized,
                "=!!",
                VALUE,
                ".normalized;"
              );
              function emitReadRecord(name) {
                block(result[name], "=", VALUE, ".", name, "|0;");
              }
              emitReadRecord("size");
              emitReadRecord("offset");
              emitReadRecord("stride");
              emitReadRecord("divisor");
              block("}}");
              block.exit(
                "if(",
                result.isStream,
                "){",
                BUFFER_STATE,
                ".destroyStream(",
                BUFFER,
                ");",
                "}"
              );
              return result;
            }
            attributeDefs[attribute] = createDynamicDecl(dyn, appendAttributeCode);
          });
          return attributeDefs;
        }
        function parseContext(context) {
          var staticContext = context.static;
          var dynamicContext = context.dynamic;
          var result = {};
          Object.keys(staticContext).forEach(function(name) {
            var value = staticContext[name];
            result[name] = createStaticDecl(function(env, scope) {
              if (typeof value === "number" || typeof value === "boolean") {
                return "" + value;
              } else {
                return env.link(value);
              }
            });
          });
          Object.keys(dynamicContext).forEach(function(name) {
            var dyn = dynamicContext[name];
            result[name] = createDynamicDecl(dyn, function(env, scope) {
              return env.invoke(scope, dyn);
            });
          });
          return result;
        }
        function parseArguments(options, attributes, uniforms, context, env) {
          var staticOptions = options.static;
          var dynamicOptions = options.dynamic;
          check$1.optional(function() {
            var KEY_NAMES = [
              S_FRAMEBUFFER,
              S_VERT,
              S_FRAG,
              S_ELEMENTS,
              S_PRIMITIVE,
              S_OFFSET,
              S_COUNT,
              S_INSTANCES,
              S_PROFILE,
              S_VAO
            ].concat(GL_STATE_NAMES);
            function checkKeys(dict) {
              Object.keys(dict).forEach(function(key) {
                check$1.command(
                  KEY_NAMES.indexOf(key) >= 0,
                  'unknown parameter "' + key + '"',
                  env.commandStr
                );
              });
            }
            checkKeys(staticOptions);
            checkKeys(dynamicOptions);
          });
          var attribLocations = parseAttribLocations(options, attributes);
          var framebuffer = parseFramebuffer(options, env);
          var viewportAndScissor = parseViewportScissor(options, framebuffer, env);
          var draw = parseDraw(options, env);
          var state = parseGLState(options, env);
          var shader = parseProgram(options, env, attribLocations);
          function copyBox(name) {
            var defn = viewportAndScissor[name];
            if (defn) {
              state[name] = defn;
            }
          }
          copyBox(S_VIEWPORT);
          copyBox(propName(S_SCISSOR_BOX));
          var dirty = Object.keys(state).length > 0;
          var result = {
            framebuffer,
            draw,
            shader,
            state,
            dirty,
            scopeVAO: null,
            drawVAO: null,
            useVAO: false,
            attributes: {}
          };
          result.profile = parseProfile(options, env);
          result.uniforms = parseUniforms(uniforms, env);
          result.drawVAO = result.scopeVAO = draw.vao;
          if (!result.drawVAO && shader.program && !attribLocations && extensions.angle_instanced_arrays && draw.static.elements) {
            var useVAO = true;
            var staticBindings = shader.program.attributes.map(function(attr) {
              var binding = attributes.static[attr];
              useVAO = useVAO && !!binding;
              return binding;
            });
            if (useVAO && staticBindings.length > 0) {
              var vao = attributeState.getVAO(attributeState.createVAO({
                attributes: staticBindings,
                elements: draw.static.elements
              }));
              result.drawVAO = new Declaration(null, null, null, function(env2, scope) {
                return env2.link(vao);
              });
              result.useVAO = true;
            }
          }
          if (attribLocations) {
            result.useVAO = true;
          } else {
            result.attributes = parseAttributes(attributes, env);
          }
          result.context = parseContext(context, env);
          return result;
        }
        function emitContext(env, scope, context) {
          var shared = env.shared;
          var CONTEXT = shared.context;
          var contextEnter = env.scope();
          Object.keys(context).forEach(function(name) {
            scope.save(CONTEXT, "." + name);
            var defn = context[name];
            var value = defn.append(env, scope);
            if (Array.isArray(value)) {
              contextEnter(CONTEXT, ".", name, "=[", value.join(), "];");
            } else {
              contextEnter(CONTEXT, ".", name, "=", value, ";");
            }
          });
          scope(contextEnter);
        }
        function emitPollFramebuffer(env, scope, framebuffer, skipCheck) {
          var shared = env.shared;
          var GL = shared.gl;
          var FRAMEBUFFER_STATE = shared.framebuffer;
          var EXT_DRAW_BUFFERS;
          if (extDrawBuffers) {
            EXT_DRAW_BUFFERS = scope.def(shared.extensions, ".webgl_draw_buffers");
          }
          var constants2 = env.constants;
          var DRAW_BUFFERS = constants2.drawBuffer;
          var BACK_BUFFER = constants2.backBuffer;
          var NEXT;
          if (framebuffer) {
            NEXT = framebuffer.append(env, scope);
          } else {
            NEXT = scope.def(FRAMEBUFFER_STATE, ".next");
          }
          if (!skipCheck) {
            scope("if(", NEXT, "!==", FRAMEBUFFER_STATE, ".cur){");
          }
          scope(
            "if(",
            NEXT,
            "){",
            GL,
            ".bindFramebuffer(",
            GL_FRAMEBUFFER$2,
            ",",
            NEXT,
            ".framebuffer);"
          );
          if (extDrawBuffers) {
            scope(
              EXT_DRAW_BUFFERS,
              ".drawBuffersWEBGL(",
              DRAW_BUFFERS,
              "[",
              NEXT,
              ".colorAttachments.length]);"
            );
          }
          scope(
            "}else{",
            GL,
            ".bindFramebuffer(",
            GL_FRAMEBUFFER$2,
            ",null);"
          );
          if (extDrawBuffers) {
            scope(EXT_DRAW_BUFFERS, ".drawBuffersWEBGL(", BACK_BUFFER, ");");
          }
          scope(
            "}",
            FRAMEBUFFER_STATE,
            ".cur=",
            NEXT,
            ";"
          );
          if (!skipCheck) {
            scope("}");
          }
        }
        function emitPollState(env, scope, args) {
          var shared = env.shared;
          var GL = shared.gl;
          var CURRENT_VARS = env.current;
          var NEXT_VARS = env.next;
          var CURRENT_STATE = shared.current;
          var NEXT_STATE = shared.next;
          var block = env.cond(CURRENT_STATE, ".dirty");
          GL_STATE_NAMES.forEach(function(prop) {
            var param = propName(prop);
            if (param in args.state) {
              return;
            }
            var NEXT, CURRENT;
            if (param in NEXT_VARS) {
              NEXT = NEXT_VARS[param];
              CURRENT = CURRENT_VARS[param];
              var parts = loop(currentState[param].length, function(i) {
                return block.def(NEXT, "[", i, "]");
              });
              block(env.cond(parts.map(function(p, i) {
                return p + "!==" + CURRENT + "[" + i + "]";
              }).join("||")).then(
                GL,
                ".",
                GL_VARIABLES[param],
                "(",
                parts,
                ");",
                parts.map(function(p, i) {
                  return CURRENT + "[" + i + "]=" + p;
                }).join(";"),
                ";"
              ));
            } else {
              NEXT = block.def(NEXT_STATE, ".", param);
              var ifte = env.cond(NEXT, "!==", CURRENT_STATE, ".", param);
              block(ifte);
              if (param in GL_FLAGS) {
                ifte(
                  env.cond(NEXT).then(GL, ".enable(", GL_FLAGS[param], ");").else(GL, ".disable(", GL_FLAGS[param], ");"),
                  CURRENT_STATE,
                  ".",
                  param,
                  "=",
                  NEXT,
                  ";"
                );
              } else {
                ifte(
                  GL,
                  ".",
                  GL_VARIABLES[param],
                  "(",
                  NEXT,
                  ");",
                  CURRENT_STATE,
                  ".",
                  param,
                  "=",
                  NEXT,
                  ";"
                );
              }
            }
          });
          if (Object.keys(args.state).length === 0) {
            block(CURRENT_STATE, ".dirty=false;");
          }
          scope(block);
        }
        function emitSetOptions(env, scope, options, filter2) {
          var shared = env.shared;
          var CURRENT_VARS = env.current;
          var CURRENT_STATE = shared.current;
          var GL = shared.gl;
          sortState(Object.keys(options)).forEach(function(param) {
            var defn = options[param];
            if (filter2 && !filter2(defn)) {
              return;
            }
            var variable = defn.append(env, scope);
            if (GL_FLAGS[param]) {
              var flag = GL_FLAGS[param];
              if (isStatic(defn)) {
                if (variable) {
                  scope(GL, ".enable(", flag, ");");
                } else {
                  scope(GL, ".disable(", flag, ");");
                }
              } else {
                scope(env.cond(variable).then(GL, ".enable(", flag, ");").else(GL, ".disable(", flag, ");"));
              }
              scope(CURRENT_STATE, ".", param, "=", variable, ";");
            } else if (isArrayLike(variable)) {
              var CURRENT = CURRENT_VARS[param];
              scope(
                GL,
                ".",
                GL_VARIABLES[param],
                "(",
                variable,
                ");",
                variable.map(function(v, i) {
                  return CURRENT + "[" + i + "]=" + v;
                }).join(";"),
                ";"
              );
            } else {
              scope(
                GL,
                ".",
                GL_VARIABLES[param],
                "(",
                variable,
                ");",
                CURRENT_STATE,
                ".",
                param,
                "=",
                variable,
                ";"
              );
            }
          });
        }
        function injectExtensions(env, scope) {
          if (extInstancing) {
            env.instancing = scope.def(
              env.shared.extensions,
              ".angle_instanced_arrays"
            );
          }
        }
        function emitProfile(env, scope, args, useScope, incrementCounter) {
          var shared = env.shared;
          var STATS = env.stats;
          var CURRENT_STATE = shared.current;
          var TIMER = shared.timer;
          var profileArg = args.profile;
          function perfCounter() {
            if (typeof performance === "undefined") {
              return "Date.now()";
            } else {
              return "performance.now()";
            }
          }
          var CPU_START, QUERY_COUNTER;
          function emitProfileStart(block) {
            CPU_START = scope.def();
            block(CPU_START, "=", perfCounter(), ";");
            if (typeof incrementCounter === "string") {
              block(STATS, ".count+=", incrementCounter, ";");
            } else {
              block(STATS, ".count++;");
            }
            if (timer2) {
              if (useScope) {
                QUERY_COUNTER = scope.def();
                block(QUERY_COUNTER, "=", TIMER, ".getNumPendingQueries();");
              } else {
                block(TIMER, ".beginQuery(", STATS, ");");
              }
            }
          }
          function emitProfileEnd(block) {
            block(STATS, ".cpuTime+=", perfCounter(), "-", CPU_START, ";");
            if (timer2) {
              if (useScope) {
                block(
                  TIMER,
                  ".pushScopeStats(",
                  QUERY_COUNTER,
                  ",",
                  TIMER,
                  ".getNumPendingQueries(),",
                  STATS,
                  ");"
                );
              } else {
                block(TIMER, ".endQuery();");
              }
            }
          }
          function scopeProfile(value) {
            var prev = scope.def(CURRENT_STATE, ".profile");
            scope(CURRENT_STATE, ".profile=", value, ";");
            scope.exit(CURRENT_STATE, ".profile=", prev, ";");
          }
          var USE_PROFILE;
          if (profileArg) {
            if (isStatic(profileArg)) {
              if (profileArg.enable) {
                emitProfileStart(scope);
                emitProfileEnd(scope.exit);
                scopeProfile("true");
              } else {
                scopeProfile("false");
              }
              return;
            }
            USE_PROFILE = profileArg.append(env, scope);
            scopeProfile(USE_PROFILE);
          } else {
            USE_PROFILE = scope.def(CURRENT_STATE, ".profile");
          }
          var start2 = env.block();
          emitProfileStart(start2);
          scope("if(", USE_PROFILE, "){", start2, "}");
          var end = env.block();
          emitProfileEnd(end);
          scope.exit("if(", USE_PROFILE, "){", end, "}");
        }
        function emitAttributes(env, scope, args, attributes, filter2) {
          var shared = env.shared;
          function typeLength(x2) {
            switch (x2) {
              case GL_FLOAT_VEC2:
              case GL_INT_VEC2:
              case GL_BOOL_VEC2:
                return 2;
              case GL_FLOAT_VEC3:
              case GL_INT_VEC3:
              case GL_BOOL_VEC3:
                return 3;
              case GL_FLOAT_VEC4:
              case GL_INT_VEC4:
              case GL_BOOL_VEC4:
                return 4;
              default:
                return 1;
            }
          }
          function emitBindAttribute(ATTRIBUTE, size, record) {
            var GL = shared.gl;
            var LOCATION = scope.def(ATTRIBUTE, ".location");
            var BINDING = scope.def(shared.attributes, "[", LOCATION, "]");
            var STATE = record.state;
            var BUFFER = record.buffer;
            var CONST_COMPONENTS = [
              record.x,
              record.y,
              record.z,
              record.w
            ];
            var COMMON_KEYS = [
              "buffer",
              "normalized",
              "offset",
              "stride"
            ];
            function emitBuffer() {
              scope(
                "if(!",
                BINDING,
                ".buffer){",
                GL,
                ".enableVertexAttribArray(",
                LOCATION,
                ");}"
              );
              var TYPE = record.type;
              var SIZE;
              if (!record.size) {
                SIZE = size;
              } else {
                SIZE = scope.def(record.size, "||", size);
              }
              scope(
                "if(",
                BINDING,
                ".type!==",
                TYPE,
                "||",
                BINDING,
                ".size!==",
                SIZE,
                "||",
                COMMON_KEYS.map(function(key) {
                  return BINDING + "." + key + "!==" + record[key];
                }).join("||"),
                "){",
                GL,
                ".bindBuffer(",
                GL_ARRAY_BUFFER$2,
                ",",
                BUFFER,
                ".buffer);",
                GL,
                ".vertexAttribPointer(",
                [
                  LOCATION,
                  SIZE,
                  TYPE,
                  record.normalized,
                  record.stride,
                  record.offset
                ],
                ");",
                BINDING,
                ".type=",
                TYPE,
                ";",
                BINDING,
                ".size=",
                SIZE,
                ";",
                COMMON_KEYS.map(function(key) {
                  return BINDING + "." + key + "=" + record[key] + ";";
                }).join(""),
                "}"
              );
              if (extInstancing) {
                var DIVISOR = record.divisor;
                scope(
                  "if(",
                  BINDING,
                  ".divisor!==",
                  DIVISOR,
                  "){",
                  env.instancing,
                  ".vertexAttribDivisorANGLE(",
                  [LOCATION, DIVISOR],
                  ");",
                  BINDING,
                  ".divisor=",
                  DIVISOR,
                  ";}"
                );
              }
            }
            function emitConstant() {
              scope(
                "if(",
                BINDING,
                ".buffer){",
                GL,
                ".disableVertexAttribArray(",
                LOCATION,
                ");",
                BINDING,
                ".buffer=null;",
                "}if(",
                CUTE_COMPONENTS.map(function(c, i) {
                  return BINDING + "." + c + "!==" + CONST_COMPONENTS[i];
                }).join("||"),
                "){",
                GL,
                ".vertexAttrib4f(",
                LOCATION,
                ",",
                CONST_COMPONENTS,
                ");",
                CUTE_COMPONENTS.map(function(c, i) {
                  return BINDING + "." + c + "=" + CONST_COMPONENTS[i] + ";";
                }).join(""),
                "}"
              );
            }
            if (STATE === ATTRIB_STATE_POINTER) {
              emitBuffer();
            } else if (STATE === ATTRIB_STATE_CONSTANT) {
              emitConstant();
            } else {
              scope("if(", STATE, "===", ATTRIB_STATE_POINTER, "){");
              emitBuffer();
              scope("}else{");
              emitConstant();
              scope("}");
            }
          }
          attributes.forEach(function(attribute) {
            var name = attribute.name;
            var arg = args.attributes[name];
            var record;
            if (arg) {
              if (!filter2(arg)) {
                return;
              }
              record = arg.append(env, scope);
            } else {
              if (!filter2(SCOPE_DECL)) {
                return;
              }
              var scopeAttrib = env.scopeAttrib(name);
              check$1.optional(function() {
                env.assert(
                  scope,
                  scopeAttrib + ".state",
                  "missing attribute " + name
                );
              });
              record = {};
              Object.keys(new AttributeRecord2()).forEach(function(key) {
                record[key] = scope.def(scopeAttrib, ".", key);
              });
            }
            emitBindAttribute(
              env.link(attribute),
              typeLength(attribute.info.type),
              record
            );
          });
        }
        function emitUniforms(env, scope, args, uniforms, filter2, isBatchInnerLoop) {
          var shared = env.shared;
          var GL = shared.gl;
          var infix;
          for (var i = 0; i < uniforms.length; ++i) {
            var uniform = uniforms[i];
            var name = uniform.name;
            var type2 = uniform.info.type;
            var arg = args.uniforms[name];
            var UNIFORM = env.link(uniform);
            var LOCATION = UNIFORM + ".location";
            var VALUE;
            if (arg) {
              if (!filter2(arg)) {
                continue;
              }
              if (isStatic(arg)) {
                var value = arg.value;
                check$1.command(
                  value !== null && typeof value !== "undefined",
                  'missing uniform "' + name + '"',
                  env.commandStr
                );
                if (type2 === GL_SAMPLER_2D || type2 === GL_SAMPLER_CUBE) {
                  check$1.command(
                    typeof value === "function" && (type2 === GL_SAMPLER_2D && (value._reglType === "texture2d" || value._reglType === "framebuffer") || type2 === GL_SAMPLER_CUBE && (value._reglType === "textureCube" || value._reglType === "framebufferCube")),
                    "invalid texture for uniform " + name,
                    env.commandStr
                  );
                  var TEX_VALUE = env.link(value._texture || value.color[0]._texture);
                  scope(GL, ".uniform1i(", LOCATION, ",", TEX_VALUE + ".bind());");
                  scope.exit(TEX_VALUE, ".unbind();");
                } else if (type2 === GL_FLOAT_MAT2 || type2 === GL_FLOAT_MAT3 || type2 === GL_FLOAT_MAT4) {
                  check$1.optional(function() {
                    check$1.command(
                      isArrayLike(value),
                      "invalid matrix for uniform " + name,
                      env.commandStr
                    );
                    check$1.command(
                      type2 === GL_FLOAT_MAT2 && value.length === 4 || type2 === GL_FLOAT_MAT3 && value.length === 9 || type2 === GL_FLOAT_MAT4 && value.length === 16,
                      "invalid length for matrix uniform " + name,
                      env.commandStr
                    );
                  });
                  var MAT_VALUE = env.global.def("new Float32Array([" + Array.prototype.slice.call(value) + "])");
                  var dim = 2;
                  if (type2 === GL_FLOAT_MAT3) {
                    dim = 3;
                  } else if (type2 === GL_FLOAT_MAT4) {
                    dim = 4;
                  }
                  scope(
                    GL,
                    ".uniformMatrix",
                    dim,
                    "fv(",
                    LOCATION,
                    ",false,",
                    MAT_VALUE,
                    ");"
                  );
                } else {
                  switch (type2) {
                    case GL_FLOAT$8:
                      check$1.commandType(value, "number", "uniform " + name, env.commandStr);
                      infix = "1f";
                      break;
                    case GL_FLOAT_VEC2:
                      check$1.command(
                        isArrayLike(value) && value.length === 2,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "2f";
                      break;
                    case GL_FLOAT_VEC3:
                      check$1.command(
                        isArrayLike(value) && value.length === 3,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "3f";
                      break;
                    case GL_FLOAT_VEC4:
                      check$1.command(
                        isArrayLike(value) && value.length === 4,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "4f";
                      break;
                    case GL_BOOL:
                      check$1.commandType(value, "boolean", "uniform " + name, env.commandStr);
                      infix = "1i";
                      break;
                    case GL_INT$3:
                      check$1.commandType(value, "number", "uniform " + name, env.commandStr);
                      infix = "1i";
                      break;
                    case GL_BOOL_VEC2:
                      check$1.command(
                        isArrayLike(value) && value.length === 2,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "2i";
                      break;
                    case GL_INT_VEC2:
                      check$1.command(
                        isArrayLike(value) && value.length === 2,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "2i";
                      break;
                    case GL_BOOL_VEC3:
                      check$1.command(
                        isArrayLike(value) && value.length === 3,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "3i";
                      break;
                    case GL_INT_VEC3:
                      check$1.command(
                        isArrayLike(value) && value.length === 3,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "3i";
                      break;
                    case GL_BOOL_VEC4:
                      check$1.command(
                        isArrayLike(value) && value.length === 4,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "4i";
                      break;
                    case GL_INT_VEC4:
                      check$1.command(
                        isArrayLike(value) && value.length === 4,
                        "uniform " + name,
                        env.commandStr
                      );
                      infix = "4i";
                      break;
                  }
                  scope(
                    GL,
                    ".uniform",
                    infix,
                    "(",
                    LOCATION,
                    ",",
                    isArrayLike(value) ? Array.prototype.slice.call(value) : value,
                    ");"
                  );
                }
                continue;
              } else {
                VALUE = arg.append(env, scope);
              }
            } else {
              if (!filter2(SCOPE_DECL)) {
                continue;
              }
              VALUE = scope.def(shared.uniforms, "[", stringStore.id(name), "]");
            }
            if (type2 === GL_SAMPLER_2D) {
              check$1(!Array.isArray(VALUE), "must specify a scalar prop for textures");
              scope(
                "if(",
                VALUE,
                "&&",
                VALUE,
                '._reglType==="framebuffer"){',
                VALUE,
                "=",
                VALUE,
                ".color[0];",
                "}"
              );
            } else if (type2 === GL_SAMPLER_CUBE) {
              check$1(!Array.isArray(VALUE), "must specify a scalar prop for cube maps");
              scope(
                "if(",
                VALUE,
                "&&",
                VALUE,
                '._reglType==="framebufferCube"){',
                VALUE,
                "=",
                VALUE,
                ".color[0];",
                "}"
              );
            }
            check$1.optional(function() {
              function emitCheck(pred, message) {
                env.assert(
                  scope,
                  pred,
                  'bad data or missing for uniform "' + name + '".  ' + message
                );
              }
              function checkType(type3) {
                check$1(!Array.isArray(VALUE), "must not specify an array type for uniform");
                emitCheck(
                  "typeof " + VALUE + '==="' + type3 + '"',
                  "invalid type, expected " + type3
                );
              }
              function checkVector(n, type3) {
                if (Array.isArray(VALUE)) {
                  check$1(VALUE.length === n, "must have length " + n);
                } else {
                  emitCheck(
                    shared.isArrayLike + "(" + VALUE + ")&&" + VALUE + ".length===" + n,
                    "invalid vector, should have length " + n,
                    env.commandStr
                  );
                }
              }
              function checkTexture(target) {
                check$1(!Array.isArray(VALUE), "must not specify a value type");
                emitCheck(
                  "typeof " + VALUE + '==="function"&&' + VALUE + '._reglType==="texture' + (target === GL_TEXTURE_2D$3 ? "2d" : "Cube") + '"',
                  "invalid texture type",
                  env.commandStr
                );
              }
              switch (type2) {
                case GL_INT$3:
                  checkType("number");
                  break;
                case GL_INT_VEC2:
                  checkVector(2, "number");
                  break;
                case GL_INT_VEC3:
                  checkVector(3, "number");
                  break;
                case GL_INT_VEC4:
                  checkVector(4, "number");
                  break;
                case GL_FLOAT$8:
                  checkType("number");
                  break;
                case GL_FLOAT_VEC2:
                  checkVector(2, "number");
                  break;
                case GL_FLOAT_VEC3:
                  checkVector(3, "number");
                  break;
                case GL_FLOAT_VEC4:
                  checkVector(4, "number");
                  break;
                case GL_BOOL:
                  checkType("boolean");
                  break;
                case GL_BOOL_VEC2:
                  checkVector(2, "boolean");
                  break;
                case GL_BOOL_VEC3:
                  checkVector(3, "boolean");
                  break;
                case GL_BOOL_VEC4:
                  checkVector(4, "boolean");
                  break;
                case GL_FLOAT_MAT2:
                  checkVector(4, "number");
                  break;
                case GL_FLOAT_MAT3:
                  checkVector(9, "number");
                  break;
                case GL_FLOAT_MAT4:
                  checkVector(16, "number");
                  break;
                case GL_SAMPLER_2D:
                  checkTexture(GL_TEXTURE_2D$3);
                  break;
                case GL_SAMPLER_CUBE:
                  checkTexture(GL_TEXTURE_CUBE_MAP$2);
                  break;
              }
            });
            var unroll = 1;
            switch (type2) {
              case GL_SAMPLER_2D:
              case GL_SAMPLER_CUBE:
                var TEX = scope.def(VALUE, "._texture");
                scope(GL, ".uniform1i(", LOCATION, ",", TEX, ".bind());");
                scope.exit(TEX, ".unbind();");
                continue;
              case GL_INT$3:
              case GL_BOOL:
                infix = "1i";
                break;
              case GL_INT_VEC2:
              case GL_BOOL_VEC2:
                infix = "2i";
                unroll = 2;
                break;
              case GL_INT_VEC3:
              case GL_BOOL_VEC3:
                infix = "3i";
                unroll = 3;
                break;
              case GL_INT_VEC4:
              case GL_BOOL_VEC4:
                infix = "4i";
                unroll = 4;
                break;
              case GL_FLOAT$8:
                infix = "1f";
                break;
              case GL_FLOAT_VEC2:
                infix = "2f";
                unroll = 2;
                break;
              case GL_FLOAT_VEC3:
                infix = "3f";
                unroll = 3;
                break;
              case GL_FLOAT_VEC4:
                infix = "4f";
                unroll = 4;
                break;
              case GL_FLOAT_MAT2:
                infix = "Matrix2fv";
                break;
              case GL_FLOAT_MAT3:
                infix = "Matrix3fv";
                break;
              case GL_FLOAT_MAT4:
                infix = "Matrix4fv";
                break;
            }
            if (infix.charAt(0) === "M") {
              scope(GL, ".uniform", infix, "(", LOCATION, ",");
              var matSize = Math.pow(type2 - GL_FLOAT_MAT2 + 2, 2);
              var STORAGE = env.global.def("new Float32Array(", matSize, ")");
              if (Array.isArray(VALUE)) {
                scope(
                  "false,(",
                  loop(matSize, function(i2) {
                    return STORAGE + "[" + i2 + "]=" + VALUE[i2];
                  }),
                  ",",
                  STORAGE,
                  ")"
                );
              } else {
                scope(
                  "false,(Array.isArray(",
                  VALUE,
                  ")||",
                  VALUE,
                  " instanceof Float32Array)?",
                  VALUE,
                  ":(",
                  loop(matSize, function(i2) {
                    return STORAGE + "[" + i2 + "]=" + VALUE + "[" + i2 + "]";
                  }),
                  ",",
                  STORAGE,
                  ")"
                );
              }
              scope(");");
            } else if (unroll > 1) {
              var prev = [];
              var cur = [];
              for (var j = 0; j < unroll; ++j) {
                if (Array.isArray(VALUE)) {
                  cur.push(VALUE[j]);
                } else {
                  cur.push(scope.def(VALUE + "[" + j + "]"));
                }
                if (isBatchInnerLoop) {
                  prev.push(scope.def());
                }
              }
              if (isBatchInnerLoop) {
                scope("if(!", env.batchId, "||", prev.map(function(p, i2) {
                  return p + "!==" + cur[i2];
                }).join("||"), "){", prev.map(function(p, i2) {
                  return p + "=" + cur[i2] + ";";
                }).join(""));
              }
              scope(GL, ".uniform", infix, "(", LOCATION, ",", cur.join(","), ");");
              if (isBatchInnerLoop) {
                scope("}");
              }
            } else {
              check$1(!Array.isArray(VALUE), "uniform value must not be an array");
              if (isBatchInnerLoop) {
                var prevS = scope.def();
                scope(
                  "if(!",
                  env.batchId,
                  "||",
                  prevS,
                  "!==",
                  VALUE,
                  "){",
                  prevS,
                  "=",
                  VALUE,
                  ";"
                );
              }
              scope(GL, ".uniform", infix, "(", LOCATION, ",", VALUE, ");");
              if (isBatchInnerLoop) {
                scope("}");
              }
            }
          }
        }
        function emitDraw(env, outer, inner, args) {
          var shared = env.shared;
          var GL = shared.gl;
          var DRAW_STATE = shared.draw;
          var drawOptions = args.draw;
          function emitElements() {
            var defn = drawOptions.elements;
            var ELEMENTS2;
            var scope = outer;
            if (defn) {
              if (defn.contextDep && args.contextDynamic || defn.propDep) {
                scope = inner;
              }
              ELEMENTS2 = defn.append(env, scope);
              if (drawOptions.elementsActive) {
                scope(
                  "if(" + ELEMENTS2 + ")" + GL + ".bindBuffer(" + GL_ELEMENT_ARRAY_BUFFER$2 + "," + ELEMENTS2 + ".buffer.buffer);"
                );
              }
            } else {
              ELEMENTS2 = scope.def();
              scope(
                ELEMENTS2,
                "=",
                DRAW_STATE,
                ".",
                S_ELEMENTS,
                ";",
                "if(",
                ELEMENTS2,
                "){",
                GL,
                ".bindBuffer(",
                GL_ELEMENT_ARRAY_BUFFER$2,
                ",",
                ELEMENTS2,
                ".buffer.buffer);}",
                "else if(",
                shared.vao,
                ".currentVAO){",
                ELEMENTS2,
                "=",
                env.shared.elements + ".getElements(" + shared.vao,
                ".currentVAO.elements);",
                !extVertexArrays ? "if(" + ELEMENTS2 + ")" + GL + ".bindBuffer(" + GL_ELEMENT_ARRAY_BUFFER$2 + "," + ELEMENTS2 + ".buffer.buffer);" : "",
                "}"
              );
            }
            return ELEMENTS2;
          }
          function emitCount() {
            var defn = drawOptions.count;
            var COUNT2;
            var scope = outer;
            if (defn) {
              if (defn.contextDep && args.contextDynamic || defn.propDep) {
                scope = inner;
              }
              COUNT2 = defn.append(env, scope);
              check$1.optional(function() {
                if (defn.MISSING) {
                  env.assert(outer, "false", "missing vertex count");
                }
                if (defn.DYNAMIC) {
                  env.assert(scope, COUNT2 + ">=0", "missing vertex count");
                }
              });
            } else {
              COUNT2 = scope.def(DRAW_STATE, ".", S_COUNT);
              check$1.optional(function() {
                env.assert(scope, COUNT2 + ">=0", "missing vertex count");
              });
            }
            return COUNT2;
          }
          var ELEMENTS = emitElements();
          function emitValue(name) {
            var defn = drawOptions[name];
            if (defn) {
              if (defn.contextDep && args.contextDynamic || defn.propDep) {
                return defn.append(env, inner);
              } else {
                return defn.append(env, outer);
              }
            } else {
              return outer.def(DRAW_STATE, ".", name);
            }
          }
          var PRIMITIVE = emitValue(S_PRIMITIVE);
          var OFFSET = emitValue(S_OFFSET);
          var COUNT = emitCount();
          if (typeof COUNT === "number") {
            if (COUNT === 0) {
              return;
            }
          } else {
            inner("if(", COUNT, "){");
            inner.exit("}");
          }
          var INSTANCES, EXT_INSTANCING;
          if (extInstancing) {
            INSTANCES = emitValue(S_INSTANCES);
            EXT_INSTANCING = env.instancing;
          }
          var ELEMENT_TYPE = ELEMENTS + ".type";
          var elementsStatic = drawOptions.elements && isStatic(drawOptions.elements) && !drawOptions.vaoActive;
          function emitInstancing() {
            function drawElements() {
              inner(EXT_INSTANCING, ".drawElementsInstancedANGLE(", [
                PRIMITIVE,
                COUNT,
                ELEMENT_TYPE,
                OFFSET + "<<((" + ELEMENT_TYPE + "-" + GL_UNSIGNED_BYTE$8 + ")>>1)",
                INSTANCES
              ], ");");
            }
            function drawArrays() {
              inner(
                EXT_INSTANCING,
                ".drawArraysInstancedANGLE(",
                [PRIMITIVE, OFFSET, COUNT, INSTANCES],
                ");"
              );
            }
            if (ELEMENTS && ELEMENTS !== "null") {
              if (!elementsStatic) {
                inner("if(", ELEMENTS, "){");
                drawElements();
                inner("}else{");
                drawArrays();
                inner("}");
              } else {
                drawElements();
              }
            } else {
              drawArrays();
            }
          }
          function emitRegular() {
            function drawElements() {
              inner(GL + ".drawElements(" + [
                PRIMITIVE,
                COUNT,
                ELEMENT_TYPE,
                OFFSET + "<<((" + ELEMENT_TYPE + "-" + GL_UNSIGNED_BYTE$8 + ")>>1)"
              ] + ");");
            }
            function drawArrays() {
              inner(GL + ".drawArrays(" + [PRIMITIVE, OFFSET, COUNT] + ");");
            }
            if (ELEMENTS && ELEMENTS !== "null") {
              if (!elementsStatic) {
                inner("if(", ELEMENTS, "){");
                drawElements();
                inner("}else{");
                drawArrays();
                inner("}");
              } else {
                drawElements();
              }
            } else {
              drawArrays();
            }
          }
          if (extInstancing && (typeof INSTANCES !== "number" || INSTANCES >= 0)) {
            if (typeof INSTANCES === "string") {
              inner("if(", INSTANCES, ">0){");
              emitInstancing();
              inner("}else if(", INSTANCES, "<0){");
              emitRegular();
              inner("}");
            } else {
              emitInstancing();
            }
          } else {
            emitRegular();
          }
        }
        function createBody(emitBody, parentEnv, args, program, count) {
          var env = createREGLEnvironment();
          var scope = env.proc("body", count);
          check$1.optional(function() {
            env.commandStr = parentEnv.commandStr;
            env.command = env.link(parentEnv.commandStr);
          });
          if (extInstancing) {
            env.instancing = scope.def(
              env.shared.extensions,
              ".angle_instanced_arrays"
            );
          }
          emitBody(env, scope, args, program);
          return env.compile().body;
        }
        function emitDrawBody(env, draw, args, program) {
          injectExtensions(env, draw);
          if (args.useVAO) {
            if (args.drawVAO) {
              draw(env.shared.vao, ".setVAO(", args.drawVAO.append(env, draw), ");");
            } else {
              draw(env.shared.vao, ".setVAO(", env.shared.vao, ".targetVAO);");
            }
          } else {
            draw(env.shared.vao, ".setVAO(null);");
            emitAttributes(env, draw, args, program.attributes, function() {
              return true;
            });
          }
          emitUniforms(env, draw, args, program.uniforms, function() {
            return true;
          }, false);
          emitDraw(env, draw, draw, args);
        }
        function emitDrawProc(env, args) {
          var draw = env.proc("draw", 1);
          injectExtensions(env, draw);
          emitContext(env, draw, args.context);
          emitPollFramebuffer(env, draw, args.framebuffer);
          emitPollState(env, draw, args);
          emitSetOptions(env, draw, args.state);
          emitProfile(env, draw, args, false, true);
          var program = args.shader.progVar.append(env, draw);
          draw(env.shared.gl, ".useProgram(", program, ".program);");
          if (args.shader.program) {
            emitDrawBody(env, draw, args, args.shader.program);
          } else {
            draw(env.shared.vao, ".setVAO(null);");
            var drawCache = env.global.def("{}");
            var PROG_ID = draw.def(program, ".id");
            var CACHED_PROC = draw.def(drawCache, "[", PROG_ID, "]");
            draw(
              env.cond(CACHED_PROC).then(CACHED_PROC, ".call(this,a0);").else(
                CACHED_PROC,
                "=",
                drawCache,
                "[",
                PROG_ID,
                "]=",
                env.link(function(program2) {
                  return createBody(emitDrawBody, env, args, program2, 1);
                }),
                "(",
                program,
                ");",
                CACHED_PROC,
                ".call(this,a0);"
              )
            );
          }
          if (Object.keys(args.state).length > 0) {
            draw(env.shared.current, ".dirty=true;");
          }
          if (env.shared.vao) {
            draw(env.shared.vao, ".setVAO(null);");
          }
        }
        function emitBatchDynamicShaderBody(env, scope, args, program) {
          env.batchId = "a1";
          injectExtensions(env, scope);
          function all() {
            return true;
          }
          emitAttributes(env, scope, args, program.attributes, all);
          emitUniforms(env, scope, args, program.uniforms, all, false);
          emitDraw(env, scope, scope, args);
        }
        function emitBatchBody(env, scope, args, program) {
          injectExtensions(env, scope);
          var contextDynamic = args.contextDep;
          var BATCH_ID = scope.def();
          var PROP_LIST = "a0";
          var NUM_PROPS = "a1";
          var PROPS = scope.def();
          env.shared.props = PROPS;
          env.batchId = BATCH_ID;
          var outer = env.scope();
          var inner = env.scope();
          scope(
            outer.entry,
            "for(",
            BATCH_ID,
            "=0;",
            BATCH_ID,
            "<",
            NUM_PROPS,
            ";++",
            BATCH_ID,
            "){",
            PROPS,
            "=",
            PROP_LIST,
            "[",
            BATCH_ID,
            "];",
            inner,
            "}",
            outer.exit
          );
          function isInnerDefn(defn) {
            return defn.contextDep && contextDynamic || defn.propDep;
          }
          function isOuterDefn(defn) {
            return !isInnerDefn(defn);
          }
          if (args.needsContext) {
            emitContext(env, inner, args.context);
          }
          if (args.needsFramebuffer) {
            emitPollFramebuffer(env, inner, args.framebuffer);
          }
          emitSetOptions(env, inner, args.state, isInnerDefn);
          if (args.profile && isInnerDefn(args.profile)) {
            emitProfile(env, inner, args, false, true);
          }
          if (!program) {
            var progCache = env.global.def("{}");
            var PROGRAM = args.shader.progVar.append(env, inner);
            var PROG_ID = inner.def(PROGRAM, ".id");
            var CACHED_PROC = inner.def(progCache, "[", PROG_ID, "]");
            inner(
              env.shared.gl,
              ".useProgram(",
              PROGRAM,
              ".program);",
              "if(!",
              CACHED_PROC,
              "){",
              CACHED_PROC,
              "=",
              progCache,
              "[",
              PROG_ID,
              "]=",
              env.link(function(program2) {
                return createBody(
                  emitBatchDynamicShaderBody,
                  env,
                  args,
                  program2,
                  2
                );
              }),
              "(",
              PROGRAM,
              ");}",
              CACHED_PROC,
              ".call(this,a0[",
              BATCH_ID,
              "],",
              BATCH_ID,
              ");"
            );
          } else {
            if (args.useVAO) {
              if (args.drawVAO) {
                if (isInnerDefn(args.drawVAO)) {
                  inner(env.shared.vao, ".setVAO(", args.drawVAO.append(env, inner), ");");
                } else {
                  outer(env.shared.vao, ".setVAO(", args.drawVAO.append(env, outer), ");");
                }
              } else {
                outer(env.shared.vao, ".setVAO(", env.shared.vao, ".targetVAO);");
              }
            } else {
              outer(env.shared.vao, ".setVAO(null);");
              emitAttributes(env, outer, args, program.attributes, isOuterDefn);
              emitAttributes(env, inner, args, program.attributes, isInnerDefn);
            }
            emitUniforms(env, outer, args, program.uniforms, isOuterDefn, false);
            emitUniforms(env, inner, args, program.uniforms, isInnerDefn, true);
            emitDraw(env, outer, inner, args);
          }
        }
        function emitBatchProc(env, args) {
          var batch = env.proc("batch", 2);
          env.batchId = "0";
          injectExtensions(env, batch);
          var contextDynamic = false;
          var needsContext = true;
          Object.keys(args.context).forEach(function(name) {
            contextDynamic = contextDynamic || args.context[name].propDep;
          });
          if (!contextDynamic) {
            emitContext(env, batch, args.context);
            needsContext = false;
          }
          var framebuffer = args.framebuffer;
          var needsFramebuffer = false;
          if (framebuffer) {
            if (framebuffer.propDep) {
              contextDynamic = needsFramebuffer = true;
            } else if (framebuffer.contextDep && contextDynamic) {
              needsFramebuffer = true;
            }
            if (!needsFramebuffer) {
              emitPollFramebuffer(env, batch, framebuffer);
            }
          } else {
            emitPollFramebuffer(env, batch, null);
          }
          if (args.state.viewport && args.state.viewport.propDep) {
            contextDynamic = true;
          }
          function isInnerDefn(defn) {
            return defn.contextDep && contextDynamic || defn.propDep;
          }
          emitPollState(env, batch, args);
          emitSetOptions(env, batch, args.state, function(defn) {
            return !isInnerDefn(defn);
          });
          if (!args.profile || !isInnerDefn(args.profile)) {
            emitProfile(env, batch, args, false, "a1");
          }
          args.contextDep = contextDynamic;
          args.needsContext = needsContext;
          args.needsFramebuffer = needsFramebuffer;
          var progDefn = args.shader.progVar;
          if (progDefn.contextDep && contextDynamic || progDefn.propDep) {
            emitBatchBody(
              env,
              batch,
              args,
              null
            );
          } else {
            var PROGRAM = progDefn.append(env, batch);
            batch(env.shared.gl, ".useProgram(", PROGRAM, ".program);");
            if (args.shader.program) {
              emitBatchBody(
                env,
                batch,
                args,
                args.shader.program
              );
            } else {
              batch(env.shared.vao, ".setVAO(null);");
              var batchCache = env.global.def("{}");
              var PROG_ID = batch.def(PROGRAM, ".id");
              var CACHED_PROC = batch.def(batchCache, "[", PROG_ID, "]");
              batch(
                env.cond(CACHED_PROC).then(CACHED_PROC, ".call(this,a0,a1);").else(
                  CACHED_PROC,
                  "=",
                  batchCache,
                  "[",
                  PROG_ID,
                  "]=",
                  env.link(function(program) {
                    return createBody(emitBatchBody, env, args, program, 2);
                  }),
                  "(",
                  PROGRAM,
                  ");",
                  CACHED_PROC,
                  ".call(this,a0,a1);"
                )
              );
            }
          }
          if (Object.keys(args.state).length > 0) {
            batch(env.shared.current, ".dirty=true;");
          }
          if (env.shared.vao) {
            batch(env.shared.vao, ".setVAO(null);");
          }
        }
        function emitScopeProc(env, args) {
          var scope = env.proc("scope", 3);
          env.batchId = "a2";
          var shared = env.shared;
          var CURRENT_STATE = shared.current;
          emitContext(env, scope, args.context);
          if (args.framebuffer) {
            args.framebuffer.append(env, scope);
          }
          sortState(Object.keys(args.state)).forEach(function(name) {
            var defn = args.state[name];
            var value = defn.append(env, scope);
            if (isArrayLike(value)) {
              value.forEach(function(v, i) {
                scope.set(env.next[name], "[" + i + "]", v);
              });
            } else {
              scope.set(shared.next, "." + name, value);
            }
          });
          emitProfile(env, scope, args, true, true);
          [S_ELEMENTS, S_OFFSET, S_COUNT, S_INSTANCES, S_PRIMITIVE].forEach(
            function(opt) {
              var variable = args.draw[opt];
              if (!variable) {
                return;
              }
              scope.set(shared.draw, "." + opt, "" + variable.append(env, scope));
            }
          );
          Object.keys(args.uniforms).forEach(function(opt) {
            var value = args.uniforms[opt].append(env, scope);
            if (Array.isArray(value)) {
              value = "[" + value.join() + "]";
            }
            scope.set(
              shared.uniforms,
              "[" + stringStore.id(opt) + "]",
              value
            );
          });
          Object.keys(args.attributes).forEach(function(name) {
            var record = args.attributes[name].append(env, scope);
            var scopeAttrib = env.scopeAttrib(name);
            Object.keys(new AttributeRecord2()).forEach(function(prop) {
              scope.set(scopeAttrib, "." + prop, record[prop]);
            });
          });
          if (args.scopeVAO) {
            scope.set(shared.vao, ".targetVAO", args.scopeVAO.append(env, scope));
          }
          function saveShader(name) {
            var shader = args.shader[name];
            if (shader) {
              scope.set(shared.shader, "." + name, shader.append(env, scope));
            }
          }
          saveShader(S_VERT);
          saveShader(S_FRAG);
          if (Object.keys(args.state).length > 0) {
            scope(CURRENT_STATE, ".dirty=true;");
            scope.exit(CURRENT_STATE, ".dirty=true;");
          }
          scope("a1(", env.shared.context, ",a0,", env.batchId, ");");
        }
        function isDynamicObject(object) {
          if (typeof object !== "object" || isArrayLike(object)) {
            return;
          }
          var props = Object.keys(object);
          for (var i = 0; i < props.length; ++i) {
            if (dynamic.isDynamic(object[props[i]])) {
              return true;
            }
          }
          return false;
        }
        function splatObject(env, options, name) {
          var object = options.static[name];
          if (!object || !isDynamicObject(object)) {
            return;
          }
          var globals = env.global;
          var keys = Object.keys(object);
          var thisDep = false;
          var contextDep = false;
          var propDep = false;
          var objectRef = env.global.def("{}");
          keys.forEach(function(key) {
            var value = object[key];
            if (dynamic.isDynamic(value)) {
              if (typeof value === "function") {
                value = object[key] = dynamic.unbox(value);
              }
              var deps = createDynamicDecl(value, null);
              thisDep = thisDep || deps.thisDep;
              propDep = propDep || deps.propDep;
              contextDep = contextDep || deps.contextDep;
            } else {
              globals(objectRef, ".", key, "=");
              switch (typeof value) {
                case "number":
                  globals(value);
                  break;
                case "string":
                  globals('"', value, '"');
                  break;
                case "object":
                  if (Array.isArray(value)) {
                    globals("[", value.join(), "]");
                  }
                  break;
                default:
                  globals(env.link(value));
                  break;
              }
              globals(";");
            }
          });
          function appendBlock(env2, block) {
            keys.forEach(function(key) {
              var value = object[key];
              if (!dynamic.isDynamic(value)) {
                return;
              }
              var ref = env2.invoke(block, value);
              block(objectRef, ".", key, "=", ref, ";");
            });
          }
          options.dynamic[name] = new dynamic.DynamicVariable(DYN_THUNK, {
            thisDep,
            contextDep,
            propDep,
            ref: objectRef,
            append: appendBlock
          });
          delete options.static[name];
        }
        function compileCommand(options, attributes, uniforms, context, stats2) {
          var env = createREGLEnvironment();
          env.stats = env.link(stats2);
          Object.keys(attributes.static).forEach(function(key) {
            splatObject(env, attributes, key);
          });
          NESTED_OPTIONS.forEach(function(name) {
            splatObject(env, options, name);
          });
          var args = parseArguments(options, attributes, uniforms, context, env);
          emitDrawProc(env, args);
          emitScopeProc(env, args);
          emitBatchProc(env, args);
          return extend2(env.compile(), {
            destroy: function() {
              args.shader.program.destroy();
            }
          });
        }
        return {
          next: nextState,
          current: currentState,
          procs: function() {
            var env = createREGLEnvironment();
            var poll = env.proc("poll");
            var refresh = env.proc("refresh");
            var common = env.block();
            poll(common);
            refresh(common);
            var shared = env.shared;
            var GL = shared.gl;
            var NEXT_STATE = shared.next;
            var CURRENT_STATE = shared.current;
            common(CURRENT_STATE, ".dirty=false;");
            emitPollFramebuffer(env, poll);
            emitPollFramebuffer(env, refresh, null, true);
            var INSTANCING;
            if (extInstancing) {
              INSTANCING = env.link(extInstancing);
            }
            if (extensions.oes_vertex_array_object) {
              refresh(env.link(extensions.oes_vertex_array_object), ".bindVertexArrayOES(null);");
            }
            for (var i = 0; i < limits.maxAttributes; ++i) {
              var BINDING = refresh.def(shared.attributes, "[", i, "]");
              var ifte = env.cond(BINDING, ".buffer");
              ifte.then(
                GL,
                ".enableVertexAttribArray(",
                i,
                ");",
                GL,
                ".bindBuffer(",
                GL_ARRAY_BUFFER$2,
                ",",
                BINDING,
                ".buffer.buffer);",
                GL,
                ".vertexAttribPointer(",
                i,
                ",",
                BINDING,
                ".size,",
                BINDING,
                ".type,",
                BINDING,
                ".normalized,",
                BINDING,
                ".stride,",
                BINDING,
                ".offset);"
              ).else(
                GL,
                ".disableVertexAttribArray(",
                i,
                ");",
                GL,
                ".vertexAttrib4f(",
                i,
                ",",
                BINDING,
                ".x,",
                BINDING,
                ".y,",
                BINDING,
                ".z,",
                BINDING,
                ".w);",
                BINDING,
                ".buffer=null;"
              );
              refresh(ifte);
              if (extInstancing) {
                refresh(
                  INSTANCING,
                  ".vertexAttribDivisorANGLE(",
                  i,
                  ",",
                  BINDING,
                  ".divisor);"
                );
              }
            }
            refresh(
              env.shared.vao,
              ".currentVAO=null;",
              env.shared.vao,
              ".setVAO(",
              env.shared.vao,
              ".targetVAO);"
            );
            Object.keys(GL_FLAGS).forEach(function(flag) {
              var cap = GL_FLAGS[flag];
              var NEXT = common.def(NEXT_STATE, ".", flag);
              var block = env.block();
              block(
                "if(",
                NEXT,
                "){",
                GL,
                ".enable(",
                cap,
                ")}else{",
                GL,
                ".disable(",
                cap,
                ")}",
                CURRENT_STATE,
                ".",
                flag,
                "=",
                NEXT,
                ";"
              );
              refresh(block);
              poll(
                "if(",
                NEXT,
                "!==",
                CURRENT_STATE,
                ".",
                flag,
                "){",
                block,
                "}"
              );
            });
            Object.keys(GL_VARIABLES).forEach(function(name) {
              var func = GL_VARIABLES[name];
              var init2 = currentState[name];
              var NEXT, CURRENT;
              var block = env.block();
              block(GL, ".", func, "(");
              if (isArrayLike(init2)) {
                var n = init2.length;
                NEXT = env.global.def(NEXT_STATE, ".", name);
                CURRENT = env.global.def(CURRENT_STATE, ".", name);
                block(
                  loop(n, function(i2) {
                    return NEXT + "[" + i2 + "]";
                  }),
                  ");",
                  loop(n, function(i2) {
                    return CURRENT + "[" + i2 + "]=" + NEXT + "[" + i2 + "];";
                  }).join("")
                );
                poll(
                  "if(",
                  loop(n, function(i2) {
                    return NEXT + "[" + i2 + "]!==" + CURRENT + "[" + i2 + "]";
                  }).join("||"),
                  "){",
                  block,
                  "}"
                );
              } else {
                NEXT = common.def(NEXT_STATE, ".", name);
                CURRENT = common.def(CURRENT_STATE, ".", name);
                block(
                  NEXT,
                  ");",
                  CURRENT_STATE,
                  ".",
                  name,
                  "=",
                  NEXT,
                  ";"
                );
                poll(
                  "if(",
                  NEXT,
                  "!==",
                  CURRENT,
                  "){",
                  block,
                  "}"
                );
              }
              refresh(block);
            });
            return env.compile();
          }(),
          compile: compileCommand
        };
      }
      function stats() {
        return {
          vaoCount: 0,
          bufferCount: 0,
          elementsCount: 0,
          framebufferCount: 0,
          shaderCount: 0,
          textureCount: 0,
          cubeCount: 0,
          renderbufferCount: 0,
          maxTextureUnits: 0
        };
      }
      var GL_QUERY_RESULT_EXT = 34918;
      var GL_QUERY_RESULT_AVAILABLE_EXT = 34919;
      var GL_TIME_ELAPSED_EXT = 35007;
      var createTimer = function(gl, extensions) {
        if (!extensions.ext_disjoint_timer_query) {
          return null;
        }
        var queryPool = [];
        function allocQuery() {
          return queryPool.pop() || extensions.ext_disjoint_timer_query.createQueryEXT();
        }
        function freeQuery(query) {
          queryPool.push(query);
        }
        var pendingQueries = [];
        function beginQuery(stats2) {
          var query = allocQuery();
          extensions.ext_disjoint_timer_query.beginQueryEXT(GL_TIME_ELAPSED_EXT, query);
          pendingQueries.push(query);
          pushScopeStats(pendingQueries.length - 1, pendingQueries.length, stats2);
        }
        function endQuery() {
          extensions.ext_disjoint_timer_query.endQueryEXT(GL_TIME_ELAPSED_EXT);
        }
        function PendingStats() {
          this.startQueryIndex = -1;
          this.endQueryIndex = -1;
          this.sum = 0;
          this.stats = null;
        }
        var pendingStatsPool = [];
        function allocPendingStats() {
          return pendingStatsPool.pop() || new PendingStats();
        }
        function freePendingStats(pendingStats2) {
          pendingStatsPool.push(pendingStats2);
        }
        var pendingStats = [];
        function pushScopeStats(start2, end, stats2) {
          var ps = allocPendingStats();
          ps.startQueryIndex = start2;
          ps.endQueryIndex = end;
          ps.sum = 0;
          ps.stats = stats2;
          pendingStats.push(ps);
        }
        var timeSum = [];
        var queryPtr = [];
        function update() {
          var ptr, i;
          var n = pendingQueries.length;
          if (n === 0) {
            return;
          }
          queryPtr.length = Math.max(queryPtr.length, n + 1);
          timeSum.length = Math.max(timeSum.length, n + 1);
          timeSum[0] = 0;
          queryPtr[0] = 0;
          var queryTime = 0;
          ptr = 0;
          for (i = 0; i < pendingQueries.length; ++i) {
            var query = pendingQueries[i];
            if (extensions.ext_disjoint_timer_query.getQueryObjectEXT(query, GL_QUERY_RESULT_AVAILABLE_EXT)) {
              queryTime += extensions.ext_disjoint_timer_query.getQueryObjectEXT(query, GL_QUERY_RESULT_EXT);
              freeQuery(query);
            } else {
              pendingQueries[ptr++] = query;
            }
            timeSum[i + 1] = queryTime;
            queryPtr[i + 1] = ptr;
          }
          pendingQueries.length = ptr;
          ptr = 0;
          for (i = 0; i < pendingStats.length; ++i) {
            var stats2 = pendingStats[i];
            var start2 = stats2.startQueryIndex;
            var end = stats2.endQueryIndex;
            stats2.sum += timeSum[end] - timeSum[start2];
            var startPtr = queryPtr[start2];
            var endPtr = queryPtr[end];
            if (endPtr === startPtr) {
              stats2.stats.gpuTime += stats2.sum / 1e6;
              freePendingStats(stats2);
            } else {
              stats2.startQueryIndex = startPtr;
              stats2.endQueryIndex = endPtr;
              pendingStats[ptr++] = stats2;
            }
          }
          pendingStats.length = ptr;
        }
        return {
          beginQuery,
          endQuery,
          pushScopeStats,
          update,
          getNumPendingQueries: function() {
            return pendingQueries.length;
          },
          clear: function() {
            queryPool.push.apply(queryPool, pendingQueries);
            for (var i = 0; i < queryPool.length; i++) {
              extensions.ext_disjoint_timer_query.deleteQueryEXT(queryPool[i]);
            }
            pendingQueries.length = 0;
            queryPool.length = 0;
          },
          restore: function() {
            pendingQueries.length = 0;
            queryPool.length = 0;
          }
        };
      };
      var GL_COLOR_BUFFER_BIT = 16384;
      var GL_DEPTH_BUFFER_BIT = 256;
      var GL_STENCIL_BUFFER_BIT = 1024;
      var GL_ARRAY_BUFFER = 34962;
      var CONTEXT_LOST_EVENT = "webglcontextlost";
      var CONTEXT_RESTORED_EVENT = "webglcontextrestored";
      var DYN_PROP = 1;
      var DYN_CONTEXT = 2;
      var DYN_STATE = 3;
      function find2(haystack, needle) {
        for (var i = 0; i < haystack.length; ++i) {
          if (haystack[i] === needle) {
            return i;
          }
        }
        return -1;
      }
      function wrapREGL(args) {
        var config = parseArgs(args);
        if (!config) {
          return null;
        }
        var gl = config.gl;
        var glAttributes = gl.getContextAttributes();
        var contextLost = gl.isContextLost();
        var extensionState = createExtensionCache(gl, config);
        if (!extensionState) {
          return null;
        }
        var stringStore = createStringStore();
        var stats$$1 = stats();
        var extensions = extensionState.extensions;
        var timer2 = createTimer(gl, extensions);
        var START_TIME = clock2();
        var WIDTH = gl.drawingBufferWidth;
        var HEIGHT = gl.drawingBufferHeight;
        var contextState = {
          tick: 0,
          time: 0,
          viewportWidth: WIDTH,
          viewportHeight: HEIGHT,
          framebufferWidth: WIDTH,
          framebufferHeight: HEIGHT,
          drawingBufferWidth: WIDTH,
          drawingBufferHeight: HEIGHT,
          pixelRatio: config.pixelRatio
        };
        var uniformState = {};
        var drawState = {
          elements: null,
          primitive: 4,
          // GL_TRIANGLES
          count: -1,
          offset: 0,
          instances: -1
        };
        var limits = wrapLimits(gl, extensions);
        var bufferState = wrapBufferState(
          gl,
          stats$$1,
          config,
          destroyBuffer
        );
        var elementState = wrapElementsState(gl, extensions, bufferState, stats$$1);
        var attributeState = wrapAttributeState(
          gl,
          extensions,
          limits,
          stats$$1,
          bufferState,
          elementState,
          drawState
        );
        function destroyBuffer(buffer) {
          return attributeState.destroyBuffer(buffer);
        }
        var shaderState = wrapShaderState(gl, stringStore, stats$$1, config);
        var textureState = createTextureSet(
          gl,
          extensions,
          limits,
          function() {
            core.procs.poll();
          },
          contextState,
          stats$$1,
          config
        );
        var renderbufferState = wrapRenderbuffers(gl, extensions, limits, stats$$1, config);
        var framebufferState = wrapFBOState(
          gl,
          extensions,
          limits,
          textureState,
          renderbufferState,
          stats$$1
        );
        var core = reglCore(
          gl,
          stringStore,
          extensions,
          limits,
          bufferState,
          elementState,
          textureState,
          framebufferState,
          uniformState,
          attributeState,
          shaderState,
          drawState,
          contextState,
          timer2,
          config
        );
        var readPixels = wrapReadPixels(
          gl,
          framebufferState,
          core.procs.poll,
          contextState,
          glAttributes,
          extensions,
          limits
        );
        var nextState = core.next;
        var canvas = gl.canvas;
        var rafCallbacks = [];
        var lossCallbacks = [];
        var restoreCallbacks = [];
        var destroyCallbacks = [config.onDestroy];
        var activeRAF = null;
        function handleRAF() {
          if (rafCallbacks.length === 0) {
            if (timer2) {
              timer2.update();
            }
            activeRAF = null;
            return;
          }
          activeRAF = raf.next(handleRAF);
          poll();
          for (var i = rafCallbacks.length - 1; i >= 0; --i) {
            var cb = rafCallbacks[i];
            if (cb) {
              cb(contextState, null, 0);
            }
          }
          gl.flush();
          if (timer2) {
            timer2.update();
          }
        }
        function startRAF() {
          if (!activeRAF && rafCallbacks.length > 0) {
            activeRAF = raf.next(handleRAF);
          }
        }
        function stopRAF() {
          if (activeRAF) {
            raf.cancel(handleRAF);
            activeRAF = null;
          }
        }
        function handleContextLoss(event) {
          event.preventDefault();
          contextLost = true;
          stopRAF();
          lossCallbacks.forEach(function(cb) {
            cb();
          });
        }
        function handleContextRestored(event) {
          gl.getError();
          contextLost = false;
          extensionState.restore();
          shaderState.restore();
          bufferState.restore();
          textureState.restore();
          renderbufferState.restore();
          framebufferState.restore();
          attributeState.restore();
          if (timer2) {
            timer2.restore();
          }
          core.procs.refresh();
          startRAF();
          restoreCallbacks.forEach(function(cb) {
            cb();
          });
        }
        if (canvas) {
          canvas.addEventListener(CONTEXT_LOST_EVENT, handleContextLoss, false);
          canvas.addEventListener(CONTEXT_RESTORED_EVENT, handleContextRestored, false);
        }
        function destroy() {
          rafCallbacks.length = 0;
          stopRAF();
          if (canvas) {
            canvas.removeEventListener(CONTEXT_LOST_EVENT, handleContextLoss);
            canvas.removeEventListener(CONTEXT_RESTORED_EVENT, handleContextRestored);
          }
          shaderState.clear();
          framebufferState.clear();
          renderbufferState.clear();
          attributeState.clear();
          textureState.clear();
          elementState.clear();
          bufferState.clear();
          if (timer2) {
            timer2.clear();
          }
          destroyCallbacks.forEach(function(cb) {
            cb();
          });
        }
        function compileProcedure(options) {
          check$1(!!options, "invalid args to regl({...})");
          check$1.type(options, "object", "invalid args to regl({...})");
          function flattenNestedOptions(options2) {
            var result = extend2({}, options2);
            delete result.uniforms;
            delete result.attributes;
            delete result.context;
            delete result.vao;
            if ("stencil" in result && result.stencil.op) {
              result.stencil.opBack = result.stencil.opFront = result.stencil.op;
              delete result.stencil.op;
            }
            function merge(name) {
              if (name in result) {
                var child = result[name];
                delete result[name];
                Object.keys(child).forEach(function(prop) {
                  result[name + "." + prop] = child[prop];
                });
              }
            }
            merge("blend");
            merge("depth");
            merge("cull");
            merge("stencil");
            merge("polygonOffset");
            merge("scissor");
            merge("sample");
            if ("vao" in options2) {
              result.vao = options2.vao;
            }
            return result;
          }
          function separateDynamic(object, useArrays) {
            var staticItems = {};
            var dynamicItems = {};
            Object.keys(object).forEach(function(option) {
              var value = object[option];
              if (dynamic.isDynamic(value)) {
                dynamicItems[option] = dynamic.unbox(value, option);
                return;
              } else if (useArrays && Array.isArray(value)) {
                for (var i = 0; i < value.length; ++i) {
                  if (dynamic.isDynamic(value[i])) {
                    dynamicItems[option] = dynamic.unbox(value, option);
                    return;
                  }
                }
              }
              staticItems[option] = value;
            });
            return {
              dynamic: dynamicItems,
              static: staticItems
            };
          }
          var context = separateDynamic(options.context || {}, true);
          var uniforms = separateDynamic(options.uniforms || {}, true);
          var attributes = separateDynamic(options.attributes || {}, false);
          var opts = separateDynamic(flattenNestedOptions(options), false);
          var stats$$12 = {
            gpuTime: 0,
            cpuTime: 0,
            count: 0
          };
          var compiled = core.compile(opts, attributes, uniforms, context, stats$$12);
          var draw = compiled.draw;
          var batch = compiled.batch;
          var scope = compiled.scope;
          var EMPTY_ARRAY = [];
          function reserve(count) {
            while (EMPTY_ARRAY.length < count) {
              EMPTY_ARRAY.push(null);
            }
            return EMPTY_ARRAY;
          }
          function REGLCommand(args2, body) {
            var i;
            if (contextLost) {
              check$1.raise("context lost");
            }
            if (typeof args2 === "function") {
              return scope.call(this, null, args2, 0);
            } else if (typeof body === "function") {
              if (typeof args2 === "number") {
                for (i = 0; i < args2; ++i) {
                  scope.call(this, null, body, i);
                }
              } else if (Array.isArray(args2)) {
                for (i = 0; i < args2.length; ++i) {
                  scope.call(this, args2[i], body, i);
                }
              } else {
                return scope.call(this, args2, body, 0);
              }
            } else if (typeof args2 === "number") {
              if (args2 > 0) {
                return batch.call(this, reserve(args2 | 0), args2 | 0);
              }
            } else if (Array.isArray(args2)) {
              if (args2.length) {
                return batch.call(this, args2, args2.length);
              }
            } else {
              return draw.call(this, args2);
            }
          }
          return extend2(REGLCommand, {
            stats: stats$$12,
            destroy: function() {
              compiled.destroy();
            }
          });
        }
        var setFBO = framebufferState.setFBO = compileProcedure({
          framebuffer: dynamic.define.call(null, DYN_PROP, "framebuffer")
        });
        function clearImpl(_, options) {
          var clearFlags = 0;
          core.procs.poll();
          var c = options.color;
          if (c) {
            gl.clearColor(+c[0] || 0, +c[1] || 0, +c[2] || 0, +c[3] || 0);
            clearFlags |= GL_COLOR_BUFFER_BIT;
          }
          if ("depth" in options) {
            gl.clearDepth(+options.depth);
            clearFlags |= GL_DEPTH_BUFFER_BIT;
          }
          if ("stencil" in options) {
            gl.clearStencil(options.stencil | 0);
            clearFlags |= GL_STENCIL_BUFFER_BIT;
          }
          check$1(!!clearFlags, "called regl.clear with no buffer specified");
          gl.clear(clearFlags);
        }
        function clear(options) {
          check$1(
            typeof options === "object" && options,
            "regl.clear() takes an object as input"
          );
          if ("framebuffer" in options) {
            if (options.framebuffer && options.framebuffer_reglType === "framebufferCube") {
              for (var i = 0; i < 6; ++i) {
                setFBO(extend2({
                  framebuffer: options.framebuffer.faces[i]
                }, options), clearImpl);
              }
            } else {
              setFBO(options, clearImpl);
            }
          } else {
            clearImpl(null, options);
          }
        }
        function frame3(cb) {
          check$1.type(cb, "function", "regl.frame() callback must be a function");
          rafCallbacks.push(cb);
          function cancel() {
            var i = find2(rafCallbacks, cb);
            check$1(i >= 0, "cannot cancel a frame twice");
            function pendingCancel() {
              var index = find2(rafCallbacks, pendingCancel);
              rafCallbacks[index] = rafCallbacks[rafCallbacks.length - 1];
              rafCallbacks.length -= 1;
              if (rafCallbacks.length <= 0) {
                stopRAF();
              }
            }
            rafCallbacks[i] = pendingCancel;
          }
          startRAF();
          return {
            cancel
          };
        }
        function pollViewport() {
          var viewport = nextState.viewport;
          var scissorBox = nextState.scissor_box;
          viewport[0] = viewport[1] = scissorBox[0] = scissorBox[1] = 0;
          contextState.viewportWidth = contextState.framebufferWidth = contextState.drawingBufferWidth = viewport[2] = scissorBox[2] = gl.drawingBufferWidth;
          contextState.viewportHeight = contextState.framebufferHeight = contextState.drawingBufferHeight = viewport[3] = scissorBox[3] = gl.drawingBufferHeight;
        }
        function poll() {
          contextState.tick += 1;
          contextState.time = now2();
          pollViewport();
          core.procs.poll();
        }
        function refresh() {
          textureState.refresh();
          pollViewport();
          core.procs.refresh();
          if (timer2) {
            timer2.update();
          }
        }
        function now2() {
          return (clock2() - START_TIME) / 1e3;
        }
        refresh();
        function addListener(event, callback) {
          check$1.type(callback, "function", "listener callback must be a function");
          var callbacks;
          switch (event) {
            case "frame":
              return frame3(callback);
            case "lost":
              callbacks = lossCallbacks;
              break;
            case "restore":
              callbacks = restoreCallbacks;
              break;
            case "destroy":
              callbacks = destroyCallbacks;
              break;
            default:
              check$1.raise("invalid event, must be one of frame,lost,restore,destroy");
          }
          callbacks.push(callback);
          return {
            cancel: function() {
              for (var i = 0; i < callbacks.length; ++i) {
                if (callbacks[i] === callback) {
                  callbacks[i] = callbacks[callbacks.length - 1];
                  callbacks.pop();
                  return;
                }
              }
            }
          };
        }
        var regl = extend2(compileProcedure, {
          // Clear current FBO
          clear,
          // Short cuts for dynamic variables
          prop: dynamic.define.bind(null, DYN_PROP),
          context: dynamic.define.bind(null, DYN_CONTEXT),
          this: dynamic.define.bind(null, DYN_STATE),
          // executes an empty draw command
          draw: compileProcedure({}),
          // Resources
          buffer: function(options) {
            return bufferState.create(options, GL_ARRAY_BUFFER, false, false);
          },
          elements: function(options) {
            return elementState.create(options, false);
          },
          texture: textureState.create2D,
          cube: textureState.createCube,
          renderbuffer: renderbufferState.create,
          framebuffer: framebufferState.create,
          framebufferCube: framebufferState.createCube,
          vao: attributeState.createVAO,
          // Expose context attributes
          attributes: glAttributes,
          // Frame rendering
          frame: frame3,
          on: addListener,
          // System limits
          limits,
          hasExtension: function(name) {
            return limits.extensions.indexOf(name.toLowerCase()) >= 0;
          },
          // Read pixels
          read: readPixels,
          // Destroy regl and all associated resources
          destroy,
          // Direct GL state manipulation
          _gl: gl,
          _refresh: refresh,
          poll: function() {
            poll();
            if (timer2) {
              timer2.update();
            }
          },
          // Current time
          now: now2,
          // regl Statistics Information
          stats: stats$$1
        });
        config.onDone(null, regl);
        return regl;
      }
      return wrapREGL;
    });
  }
});

// node_modules/d3-array/src/ascending.js
function ascending(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-array/src/descending.js
function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

// node_modules/d3-array/src/bisector.js
function bisector(f) {
  let compare1, compare2, delta;
  if (f.length !== 2) {
    compare1 = ascending;
    compare2 = (d, x2) => ascending(f(d), x2);
    delta = (d, x2) => f(d) - x2;
  } else {
    compare1 = f === ascending || f === descending ? f : zero;
    compare2 = f;
    delta = f;
  }
  function left2(a, x2, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x2) < 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right2(a, x2, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x2, x2) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x2) <= 0) lo = mid + 1;
        else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center2(a, x2, lo = 0, hi = a.length) {
    const i = left2(a, x2, lo, hi - 1);
    return i > lo && delta(a[i - 1], x2) > -delta(a[i], x2) ? i - 1 : i;
  }
  return { left: left2, center: center2, right: right2 };
}
function zero() {
  return 0;
}

// node_modules/d3-array/src/number.js
function number(x2) {
  return x2 === null ? NaN : +x2;
}

// node_modules/d3-array/src/bisect.js
var ascendingBisect = bisector(ascending);
var bisectRight = ascendingBisect.right;
var bisectLeft = ascendingBisect.left;
var bisectCenter = bisector(number).center;
var bisect_default = bisectRight;

// node_modules/d3-array/src/extent.js
function extent(values, valueof) {
  let min3;
  let max3;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null) {
        if (min3 === void 0) {
          if (value >= value) min3 = max3 = value;
        } else {
          if (min3 > value) min3 = value;
          if (max3 < value) max3 = value;
        }
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null) {
        if (min3 === void 0) {
          if (value >= value) min3 = max3 = value;
        } else {
          if (min3 > value) min3 = value;
          if (max3 < value) max3 = value;
        }
      }
    }
  }
  return [min3, max3];
}

// node_modules/d3-array/src/ticks.js
var e10 = Math.sqrt(50);
var e5 = Math.sqrt(10);
var e2 = Math.sqrt(2);
function tickSpec(start2, stop, count) {
  const step = (stop - start2) / Math.max(0, count), power = Math.floor(Math.log10(step)), error = step / Math.pow(10, power), factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start2 * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start2) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start2 / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start2) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start2, stop, count * 2);
  return [i1, i2, inc];
}
function ticks(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  if (!(count > 0)) return [];
  if (start2 === stop) return [start2];
  const reverse = stop < start2, [i1, i2, inc] = reverse ? tickSpec(stop, start2, count) : tickSpec(start2, stop, count);
  if (!(i2 >= i1)) return [];
  const n = i2 - i1 + 1, ticks2 = new Array(n);
  if (reverse) {
    if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) / -inc;
    else for (let i = 0; i < n; ++i) ticks2[i] = (i2 - i) * inc;
  } else {
    if (inc < 0) for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) / -inc;
    else for (let i = 0; i < n; ++i) ticks2[i] = (i1 + i) * inc;
  }
  return ticks2;
}
function tickIncrement(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  return tickSpec(start2, stop, count)[2];
}
function tickStep(start2, stop, count) {
  stop = +stop, start2 = +start2, count = +count;
  const reverse = stop < start2, inc = reverse ? tickIncrement(stop, start2, count) : tickIncrement(start2, stop, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}

// node_modules/d3-array/src/max.js
function max(values, valueof) {
  let max3;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null && (max3 < value || max3 === void 0 && value >= value)) {
        max3 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (max3 < value || max3 === void 0 && value >= value)) {
        max3 = value;
      }
    }
  }
  return max3;
}

// node_modules/d3-array/src/min.js
function min(values, valueof) {
  let min3;
  if (valueof === void 0) {
    for (const value of values) {
      if (value != null && (min3 > value || min3 === void 0 && value >= value)) {
        min3 = value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (min3 > value || min3 === void 0 && value >= value)) {
        min3 = value;
      }
    }
  }
  return min3;
}

// node_modules/d3-array/src/mean.js
function mean(values, valueof) {
  let count = 0;
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value of values) {
      if (value != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if ((value = valueof(value, ++index, values)) != null && (value = +value) >= value) {
        ++count, sum2 += value;
      }
    }
  }
  if (count) return sum2 / count;
}

// node_modules/d3-array/src/range.js
function range(start2, stop, step) {
  start2 = +start2, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start2, start2 = 0, 1) : n < 3 ? 1 : +step;
  var i = -1, n = Math.max(0, Math.ceil((stop - start2) / step)) | 0, range2 = new Array(n);
  while (++i < n) {
    range2[i] = start2 + i * step;
  }
  return range2;
}

// node_modules/d3-array/src/sum.js
function sum(values, valueof) {
  let sum2 = 0;
  if (valueof === void 0) {
    for (let value of values) {
      if (value = +value) {
        sum2 += value;
      }
    }
  } else {
    let index = -1;
    for (let value of values) {
      if (value = +valueof(value, ++index, values)) {
        sum2 += value;
      }
    }
  }
  return sum2;
}

// node_modules/d3-axis/src/identity.js
function identity_default(x2) {
  return x2;
}

// node_modules/d3-axis/src/axis.js
var top = 1;
var right = 2;
var bottom = 3;
var left = 4;
var epsilon = 1e-6;
function translateX(x2) {
  return "translate(" + x2 + ",0)";
}
function translateY(y2) {
  return "translate(0," + y2 + ")";
}
function number2(scale) {
  return (d) => +scale(d);
}
function center(scale, offset) {
  offset = Math.max(0, scale.bandwidth() - offset * 2) / 2;
  if (scale.round()) offset = Math.round(offset);
  return (d) => +scale(d) + offset;
}
function entering() {
  return !this.__axis;
}
function axis(orient, scale) {
  var tickArguments = [], tickValues = null, tickFormat2 = null, tickSizeInner = 6, tickSizeOuter = 6, tickPadding = 3, offset = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 0 : 0.5, k = orient === top || orient === left ? -1 : 1, x2 = orient === left || orient === right ? "x" : "y", transform2 = orient === top || orient === bottom ? translateX : translateY;
  function axis2(context) {
    var values = tickValues == null ? scale.ticks ? scale.ticks.apply(scale, tickArguments) : scale.domain() : tickValues, format2 = tickFormat2 == null ? scale.tickFormat ? scale.tickFormat.apply(scale, tickArguments) : identity_default : tickFormat2, spacing = Math.max(tickSizeInner, 0) + tickPadding, range2 = scale.range(), range0 = +range2[0] + offset, range1 = +range2[range2.length - 1] + offset, position = (scale.bandwidth ? center : number2)(scale.copy(), offset), selection2 = context.selection ? context.selection() : context, path2 = selection2.selectAll(".domain").data([null]), tick = selection2.selectAll(".tick").data(values, scale).order(), tickExit = tick.exit(), tickEnter = tick.enter().append("g").attr("class", "tick"), line = tick.select("line"), text = tick.select("text");
    path2 = path2.merge(path2.enter().insert("path", ".tick").attr("class", "domain").attr("stroke", "currentColor"));
    tick = tick.merge(tickEnter);
    line = line.merge(tickEnter.append("line").attr("stroke", "currentColor").attr(x2 + "2", k * tickSizeInner));
    text = text.merge(tickEnter.append("text").attr("fill", "currentColor").attr(x2, k * spacing).attr("dy", orient === top ? "0em" : orient === bottom ? "0.71em" : "0.32em"));
    if (context !== selection2) {
      path2 = path2.transition(context);
      tick = tick.transition(context);
      line = line.transition(context);
      text = text.transition(context);
      tickExit = tickExit.transition(context).attr("opacity", epsilon).attr("transform", function(d) {
        return isFinite(d = position(d)) ? transform2(d + offset) : this.getAttribute("transform");
      });
      tickEnter.attr("opacity", epsilon).attr("transform", function(d) {
        var p = this.parentNode.__axis;
        return transform2((p && isFinite(p = p(d)) ? p : position(d)) + offset);
      });
    }
    tickExit.remove();
    path2.attr("d", orient === left || orient === right ? tickSizeOuter ? "M" + k * tickSizeOuter + "," + range0 + "H" + offset + "V" + range1 + "H" + k * tickSizeOuter : "M" + offset + "," + range0 + "V" + range1 : tickSizeOuter ? "M" + range0 + "," + k * tickSizeOuter + "V" + offset + "H" + range1 + "V" + k * tickSizeOuter : "M" + range0 + "," + offset + "H" + range1);
    tick.attr("opacity", 1).attr("transform", function(d) {
      return transform2(position(d) + offset);
    });
    line.attr(x2 + "2", k * tickSizeInner);
    text.attr(x2, k * spacing).text(format2);
    selection2.filter(entering).attr("fill", "none").attr("font-size", 10).attr("font-family", "sans-serif").attr("text-anchor", orient === right ? "start" : orient === left ? "end" : "middle");
    selection2.each(function() {
      this.__axis = position;
    });
  }
  axis2.scale = function(_) {
    return arguments.length ? (scale = _, axis2) : scale;
  };
  axis2.ticks = function() {
    return tickArguments = Array.from(arguments), axis2;
  };
  axis2.tickArguments = function(_) {
    return arguments.length ? (tickArguments = _ == null ? [] : Array.from(_), axis2) : tickArguments.slice();
  };
  axis2.tickValues = function(_) {
    return arguments.length ? (tickValues = _ == null ? null : Array.from(_), axis2) : tickValues && tickValues.slice();
  };
  axis2.tickFormat = function(_) {
    return arguments.length ? (tickFormat2 = _, axis2) : tickFormat2;
  };
  axis2.tickSize = function(_) {
    return arguments.length ? (tickSizeInner = tickSizeOuter = +_, axis2) : tickSizeInner;
  };
  axis2.tickSizeInner = function(_) {
    return arguments.length ? (tickSizeInner = +_, axis2) : tickSizeInner;
  };
  axis2.tickSizeOuter = function(_) {
    return arguments.length ? (tickSizeOuter = +_, axis2) : tickSizeOuter;
  };
  axis2.tickPadding = function(_) {
    return arguments.length ? (tickPadding = +_, axis2) : tickPadding;
  };
  axis2.offset = function(_) {
    return arguments.length ? (offset = +_, axis2) : offset;
  };
  return axis2;
}
function axisBottom(scale) {
  return axis(bottom, scale);
}
function axisLeft(scale) {
  return axis(left, scale);
}

// node_modules/d3-dispatch/src/dispatch.js
var noop = { value: () => {
} };
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return { type: t, name };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._, T = parseTypenames(typename + "", _), t, i = -1, n = T.length;
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }
    return this;
  },
  copy: function() {
    var copy2 = {}, _ = this._;
    for (var t in _) copy2[t] = _[t].slice();
    return new Dispatch(copy2);
  },
  call: function(type2, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type2, that, args) {
    if (!this._.hasOwnProperty(type2)) throw new Error("unknown type: " + type2);
    for (var t = this._[type2], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get(type2, name) {
  for (var i = 0, n = type2.length, c; i < n; ++i) {
    if ((c = type2[i]).name === name) {
      return c.value;
    }
  }
}
function set(type2, name, callback) {
  for (var i = 0, n = type2.length; i < n; ++i) {
    if (type2[i].name === name) {
      type2[i] = noop, type2 = type2.slice(0, i).concat(type2.slice(i + 1));
      break;
    }
  }
  if (callback != null) type2.push({ name, value: callback });
  return type2;
}
var dispatch_default = dispatch;

// node_modules/d3-selection/src/namespaces.js
var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces_default = {
  svg: "http://www.w3.org/2000/svg",
  xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

// node_modules/d3-selection/src/namespace.js
function namespace_default(name) {
  var prefix = name += "", i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces_default.hasOwnProperty(prefix) ? { space: namespaces_default[prefix], local: name } : name;
}

// node_modules/d3-selection/src/creator.js
function creatorInherit(name) {
  return function() {
    var document2 = this.ownerDocument, uri = this.namespaceURI;
    return uri === xhtml && document2.documentElement.namespaceURI === xhtml ? document2.createElement(name) : document2.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function() {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator_default(name) {
  var fullname = namespace_default(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

// node_modules/d3-selection/src/selector.js
function none() {
}
function selector_default(selector) {
  return selector == null ? none : function() {
    return this.querySelector(selector);
  };
}

// node_modules/d3-selection/src/selection/select.js
function select_default(select) {
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/array.js
function array(x2) {
  return x2 == null ? [] : Array.isArray(x2) ? x2 : Array.from(x2);
}

// node_modules/d3-selection/src/selectorAll.js
function empty() {
  return [];
}
function selectorAll_default(selector) {
  return selector == null ? empty : function() {
    return this.querySelectorAll(selector);
  };
}

// node_modules/d3-selection/src/selection/selectAll.js
function arrayAll(select) {
  return function() {
    return array(select.apply(this, arguments));
  };
}
function selectAll_default(select) {
  if (typeof select === "function") select = arrayAll(select);
  else select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection(subgroups, parents);
}

// node_modules/d3-selection/src/matcher.js
function matcher_default(selector) {
  return function() {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function(node) {
    return node.matches(selector);
  };
}

// node_modules/d3-selection/src/selection/selectChild.js
var find = Array.prototype.find;
function childFind(match) {
  return function() {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selectChild_default(match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/selectChildren.js
var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function() {
    return filter.call(this.children, match);
  };
}
function selectChildren_default(match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

// node_modules/d3-selection/src/selection/filter.js
function filter_default(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection(subgroups, this._parents);
}

// node_modules/d3-selection/src/selection/sparse.js
function sparse_default(update) {
  return new Array(update.length);
}

// node_modules/d3-selection/src/selection/enter.js
function enter_default() {
  return new Selection(this._enter || this._groups.map(sparse_default), this._parents);
}
function EnterNode(parent, datum2) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum2;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function(child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function(child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function(selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function(selector) {
    return this._parent.querySelectorAll(selector);
  }
};

// node_modules/d3-selection/src/constant.js
function constant_default(x2) {
  return function() {
    return x2;
  };
}

// node_modules/d3-selection/src/selection/data.js
function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0, node, groupLength = group.length, dataLength = data.length;
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i, node, nodeByKeyValue = /* @__PURE__ */ new Map(), groupLength = group.length, dataLength = data.length, keyValues = new Array(groupLength), keyValue;
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function data_default(value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex, parents = this._parents, groups = this._groups;
  if (typeof value !== "function") value = constant_default(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j], group = groups[j], groupLength = group.length, data = arraylike(value.call(parent, parent && parent.__data__, j, parents)), dataLength = data.length, enterGroup = enter[j] = new Array(dataLength), updateGroup = update[j] = new Array(dataLength), exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength) ;
        previous._next = next || null;
      }
    }
  }
  update = new Selection(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data : Array.from(data);
}

// node_modules/d3-selection/src/selection/exit.js
function exit_default() {
  return new Selection(this._exit || this._groups.map(sparse_default), this._parents);
}

// node_modules/d3-selection/src/selection/join.js
function join_default(onenter, onupdate, onexit) {
  var enter = this.enter(), update = this, exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();
  else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

// node_modules/d3-selection/src/selection/merge.js
function merge_default(context) {
  var selection2 = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection(merges, this._parents);
}

// node_modules/d3-selection/src/selection/order.js
function order_default() {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m; ) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0; ) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/sort.js
function sort_default(compare) {
  if (!compare) compare = ascending2;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection(sortgroups, this._parents).order();
}
function ascending2(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

// node_modules/d3-selection/src/selection/call.js
function call_default() {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

// node_modules/d3-selection/src/selection/nodes.js
function nodes_default() {
  return Array.from(this);
}

// node_modules/d3-selection/src/selection/node.js
function node_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}

// node_modules/d3-selection/src/selection/size.js
function size_default() {
  let size = 0;
  for (const node of this) ++size;
  return size;
}

// node_modules/d3-selection/src/selection/empty.js
function empty_default() {
  return !this.node();
}

// node_modules/d3-selection/src/selection/each.js
function each_default(callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

// node_modules/d3-selection/src/selection/attr.js
function attrRemove(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, value) {
  return function() {
    this.setAttribute(name, value);
  };
}
function attrConstantNS(fullname, value) {
  return function() {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);
    else this.setAttribute(name, v);
  };
}
function attrFunctionNS(fullname, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
    else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function attr_default(name, value) {
  var fullname = namespace_default(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS : attrRemove : typeof value === "function" ? fullname.local ? attrFunctionNS : attrFunction : fullname.local ? attrConstantNS : attrConstant)(fullname, value));
}

// node_modules/d3-selection/src/window.js
function window_default(node) {
  return node.ownerDocument && node.ownerDocument.defaultView || node.document && node || node.defaultView;
}

// node_modules/d3-selection/src/selection/style.js
function styleRemove(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, value, priority) {
  return function() {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction(name, value, priority) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);
    else this.style.setProperty(name, v, priority);
  };
}
function style_default(name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove : typeof value === "function" ? styleFunction : styleConstant)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || window_default(node).getComputedStyle(node, null).getPropertyValue(name);
}

// node_modules/d3-selection/src/selection/property.js
function propertyRemove(name) {
  return function() {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function() {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];
    else this[name] = v;
  };
}
function property_default(name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

// node_modules/d3-selection/src/selection/classed.js
function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function(name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function(name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function(name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node), i = -1, n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function() {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function() {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function() {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function classed_default(name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()), i = -1, n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

// node_modules/d3-selection/src/selection/text.js
function textRemove() {
  this.textContent = "";
}
function textConstant(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function text_default(value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction : textConstant)(value)) : this.node().textContent;
}

// node_modules/d3-selection/src/selection/html.js
function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function() {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function() {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function html_default(value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

// node_modules/d3-selection/src/selection/raise.js
function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function raise_default() {
  return this.each(raise);
}

// node_modules/d3-selection/src/selection/lower.js
function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function lower_default() {
  return this.each(lower);
}

// node_modules/d3-selection/src/selection/append.js
function append_default(name) {
  var create2 = typeof name === "function" ? name : creator_default(name);
  return this.select(function() {
    return this.appendChild(create2.apply(this, arguments));
  });
}

// node_modules/d3-selection/src/selection/insert.js
function constantNull() {
  return null;
}
function insert_default(name, before) {
  var create2 = typeof name === "function" ? name : creator_default(name), select = before == null ? constantNull : typeof before === "function" ? before : selector_default(before);
  return this.select(function() {
    return this.insertBefore(create2.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

// node_modules/d3-selection/src/selection/remove.js
function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function remove_default() {
  return this.each(remove);
}

// node_modules/d3-selection/src/selection/clone.js
function selection_cloneShallow() {
  var clone = this.cloneNode(false), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true), parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function clone_default(deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

// node_modules/d3-selection/src/selection/datum.js
function datum_default(value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

// node_modules/d3-selection/src/selection/on.js
function contextListener(listener) {
  return function(event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames2(typenames) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return { type: t, name };
  });
}
function onRemove(typename) {
  return function() {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;
    else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function() {
    var on = this.__on, o, listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = { type: typename.type, name: typename.name, value, listener, options };
    if (!on) this.__on = [o];
    else on.push(o);
  };
}
function on_default(typename, value, options) {
  var typenames = parseTypenames2(typename + ""), i, n = typenames.length, t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

// node_modules/d3-selection/src/selection/dispatch.js
function dispatchEvent(node, type2, params) {
  var window2 = window_default(node), event = window2.CustomEvent;
  if (typeof event === "function") {
    event = new event(type2, params);
  } else {
    event = window2.document.createEvent("Event");
    if (params) event.initEvent(type2, params.bubbles, params.cancelable), event.detail = params.detail;
    else event.initEvent(type2, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params);
  };
}
function dispatchFunction(type2, params) {
  return function() {
    return dispatchEvent(this, type2, params.apply(this, arguments));
  };
}
function dispatch_default2(type2, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type2, params));
}

// node_modules/d3-selection/src/selection/iterator.js
function* iterator_default() {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

// node_modules/d3-selection/src/selection/index.js
var root = [null];
function Selection(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection.prototype = selection.prototype = {
  constructor: Selection,
  select: select_default,
  selectAll: selectAll_default,
  selectChild: selectChild_default,
  selectChildren: selectChildren_default,
  filter: filter_default,
  data: data_default,
  enter: enter_default,
  exit: exit_default,
  join: join_default,
  merge: merge_default,
  selection: selection_selection,
  order: order_default,
  sort: sort_default,
  call: call_default,
  nodes: nodes_default,
  node: node_default,
  size: size_default,
  empty: empty_default,
  each: each_default,
  attr: attr_default,
  style: style_default,
  property: property_default,
  classed: classed_default,
  text: text_default,
  html: html_default,
  raise: raise_default,
  lower: lower_default,
  append: append_default,
  insert: insert_default,
  remove: remove_default,
  clone: clone_default,
  datum: datum_default,
  on: on_default,
  dispatch: dispatch_default2,
  [Symbol.iterator]: iterator_default
};
var selection_default = selection;

// node_modules/d3-selection/src/select.js
function select_default2(selector) {
  return typeof selector === "string" ? new Selection([[document.querySelector(selector)]], [document.documentElement]) : new Selection([[selector]], root);
}

// node_modules/d3-selection/src/create.js
function create_default(name) {
  return select_default2(creator_default(name).call(document.documentElement));
}

// node_modules/d3-selection/src/sourceEvent.js
function sourceEvent_default(event) {
  let sourceEvent;
  while (sourceEvent = event.sourceEvent) event = sourceEvent;
  return event;
}

// node_modules/d3-selection/src/pointer.js
function pointer_default(event, node) {
  event = sourceEvent_default(event);
  if (node === void 0) node = event.currentTarget;
  if (node) {
    var svg = node.ownerSVGElement || node;
    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }
    if (node.getBoundingClientRect) {
      var rect = node.getBoundingClientRect();
      return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
    }
  }
  return [event.pageX, event.pageY];
}

// node_modules/d3-drag/src/noevent.js
var nonpassive = { passive: false };
var nonpassivecapture = { capture: true, passive: false };
function nopropagation(event) {
  event.stopImmediatePropagation();
}
function noevent_default(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// node_modules/d3-drag/src/nodrag.js
function nodrag_default(view) {
  var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", noevent_default, nonpassivecapture);
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", noevent_default, nonpassivecapture);
  } else {
    root2.__noselect = root2.style.MozUserSelect;
    root2.style.MozUserSelect = "none";
  }
}
function yesdrag(view, noclick) {
  var root2 = view.document.documentElement, selection2 = select_default2(view).on("dragstart.drag", null);
  if (noclick) {
    selection2.on("click.drag", noevent_default, nonpassivecapture);
    setTimeout(function() {
      selection2.on("click.drag", null);
    }, 0);
  }
  if ("onselectstart" in root2) {
    selection2.on("selectstart.drag", null);
  } else {
    root2.style.MozUserSelect = root2.__noselect;
    delete root2.__noselect;
  }
}

// node_modules/d3-drag/src/constant.js
var constant_default2 = (x2) => () => x2;

// node_modules/d3-drag/src/event.js
function DragEvent(type2, {
  sourceEvent,
  subject,
  target,
  identifier,
  active,
  x: x2,
  y: y2,
  dx,
  dy,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type2, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    subject: { value: subject, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    identifier: { value: identifier, enumerable: true, configurable: true },
    active: { value: active, enumerable: true, configurable: true },
    x: { value: x2, enumerable: true, configurable: true },
    y: { value: y2, enumerable: true, configurable: true },
    dx: { value: dx, enumerable: true, configurable: true },
    dy: { value: dy, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}
DragEvent.prototype.on = function() {
  var value = this._.on.apply(this._, arguments);
  return value === this._ ? this : value;
};

// node_modules/d3-drag/src/drag.js
function defaultFilter(event) {
  return !event.ctrlKey && !event.button;
}
function defaultContainer() {
  return this.parentNode;
}
function defaultSubject(event, d) {
  return d == null ? { x: event.x, y: event.y } : d;
}
function defaultTouchable() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function drag_default() {
  var filter2 = defaultFilter, container = defaultContainer, subject = defaultSubject, touchable = defaultTouchable, gestures = {}, listeners = dispatch_default("start", "drag", "end"), active = 0, mousedownx, mousedowny, mousemoving, touchending, clickDistance2 = 0;
  function drag(selection2) {
    selection2.on("mousedown.drag", mousedowned).filter(touchable).on("touchstart.drag", touchstarted).on("touchmove.drag", touchmoved, nonpassive).on("touchend.drag touchcancel.drag", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  function mousedowned(event, d) {
    if (touchending || !filter2.call(this, event, d)) return;
    var gesture = beforestart(this, container.call(this, event, d), event, d, "mouse");
    if (!gesture) return;
    select_default2(event.view).on("mousemove.drag", mousemoved, nonpassivecapture).on("mouseup.drag", mouseupped, nonpassivecapture);
    nodrag_default(event.view);
    nopropagation(event);
    mousemoving = false;
    mousedownx = event.clientX;
    mousedowny = event.clientY;
    gesture("start", event);
  }
  function mousemoved(event) {
    noevent_default(event);
    if (!mousemoving) {
      var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
      mousemoving = dx * dx + dy * dy > clickDistance2;
    }
    gestures.mouse("drag", event);
  }
  function mouseupped(event) {
    select_default2(event.view).on("mousemove.drag mouseup.drag", null);
    yesdrag(event.view, mousemoving);
    noevent_default(event);
    gestures.mouse("end", event);
  }
  function touchstarted(event, d) {
    if (!filter2.call(this, event, d)) return;
    var touches = event.changedTouches, c = container.call(this, event, d), n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = beforestart(this, c, event, d, touches[i].identifier, touches[i])) {
        nopropagation(event);
        gesture("start", event, touches[i]);
      }
    }
  }
  function touchmoved(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        noevent_default(event);
        gesture("drag", event, touches[i]);
      }
    }
  }
  function touchended(event) {
    var touches = event.changedTouches, n = touches.length, i, gesture;
    if (touchending) clearTimeout(touchending);
    touchending = setTimeout(function() {
      touchending = null;
    }, 500);
    for (i = 0; i < n; ++i) {
      if (gesture = gestures[touches[i].identifier]) {
        nopropagation(event);
        gesture("end", event, touches[i]);
      }
    }
  }
  function beforestart(that, container2, event, d, identifier, touch) {
    var dispatch2 = listeners.copy(), p = pointer_default(touch || event, container2), dx, dy, s;
    if ((s = subject.call(that, new DragEvent("beforestart", {
      sourceEvent: event,
      target: drag,
      identifier,
      active,
      x: p[0],
      y: p[1],
      dx: 0,
      dy: 0,
      dispatch: dispatch2
    }), d)) == null) return;
    dx = s.x - p[0] || 0;
    dy = s.y - p[1] || 0;
    return function gesture(type2, event2, touch2) {
      var p0 = p, n;
      switch (type2) {
        case "start":
          gestures[identifier] = gesture, n = active++;
          break;
        case "end":
          delete gestures[identifier], --active;
        // falls through
        case "drag":
          p = pointer_default(touch2 || event2, container2), n = active;
          break;
      }
      dispatch2.call(
        type2,
        that,
        new DragEvent(type2, {
          sourceEvent: event2,
          subject: s,
          target: drag,
          identifier,
          active: n,
          x: p[0] + dx,
          y: p[1] + dy,
          dx: p[0] - p0[0],
          dy: p[1] - p0[1],
          dispatch: dispatch2
        }),
        d
      );
    };
  }
  drag.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default2(!!_), drag) : filter2;
  };
  drag.container = function(_) {
    return arguments.length ? (container = typeof _ === "function" ? _ : constant_default2(_), drag) : container;
  };
  drag.subject = function(_) {
    return arguments.length ? (subject = typeof _ === "function" ? _ : constant_default2(_), drag) : subject;
  };
  drag.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default2(!!_), drag) : touchable;
  };
  drag.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? drag : value;
  };
  drag.clickDistance = function(_) {
    return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
  };
  return drag;
}

// node_modules/d3-color/src/define.js
function define_default(constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

// node_modules/d3-color/src/color.js
function Color() {
}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*";
var reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*";
var reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*";
var reHex = /^#([0-9a-f]{3,8})$/;
var reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`);
var reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`);
var reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`);
var reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`);
var reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`);
var reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
};
define_default(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format2) {
  var m, l;
  format2 = (format2 + "").trim().toLowerCase();
  return (m = reHex.exec(format2)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) : l === 3 ? new Rgb(m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, (m & 15) << 4 | m & 15, 1) : l === 8 ? rgba(m >> 24 & 255, m >> 16 & 255, m >> 8 & 255, (m & 255) / 255) : l === 4 ? rgba(m >> 12 & 15 | m >> 8 & 240, m >> 8 & 15 | m >> 4 & 240, m >> 4 & 15 | m & 240, ((m & 15) << 4 | m & 15) / 255) : null) : (m = reRgbInteger.exec(format2)) ? new Rgb(m[1], m[2], m[3], 1) : (m = reRgbPercent.exec(format2)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) : (m = reRgbaInteger.exec(format2)) ? rgba(m[1], m[2], m[3], m[4]) : (m = reRgbaPercent.exec(format2)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) : (m = reHslPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) : (m = reHslaPercent.exec(format2)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) : named.hasOwnProperty(format2) ? rgbn(named[format2]) : format2 === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 255, n >> 8 & 255, n & 255, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && (-0.5 <= this.g && this.g < 255.5) && (-0.5 <= this.b && this.b < 255.5) && (0 <= this.opacity && this.opacity <= 1);
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h3, s, l, a) {
  if (a <= 0) h3 = s = l = NaN;
  else if (l <= 0 || l >= 1) h3 = s = NaN;
  else if (s <= 0) h3 = NaN;
  return new Hsl(h3, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255, g = o.g / 255, b = o.b / 255, min3 = Math.min(r, g, b), max3 = Math.max(r, g, b), h3 = NaN, s = max3 - min3, l = (max3 + min3) / 2;
  if (s) {
    if (r === max3) h3 = (g - b) / s + (g < b) * 6;
    else if (g === max3) h3 = (b - r) / s + 2;
    else h3 = (r - g) / s + 4;
    s /= l < 0.5 ? max3 + min3 : 2 - max3 - min3;
    h3 *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h3;
  }
  return new Hsl(h3, s, l, o.opacity);
}
function hsl(h3, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h3) : new Hsl(h3, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h3, s, l, opacity) {
  this.h = +h3;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define_default(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h3 = this.h % 360 + (this.h < 0) * 360, s = isNaN(h3) || isNaN(this.s) ? 0 : this.s, l = this.l, m2 = l + (l < 0.5 ? l : 1 - l) * s, m1 = 2 * l - m2;
    return new Rgb(
      hsl2rgb(h3 >= 240 ? h3 - 240 : h3 + 120, m1, m2),
      hsl2rgb(h3, m1, m2),
      hsl2rgb(h3 < 120 ? h3 + 240 : h3 - 120, m1, m2),
      this.opacity
    );
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && (0 <= this.l && this.l <= 1) && (0 <= this.opacity && this.opacity <= 1);
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}
function hsl2rgb(h3, m1, m2) {
  return (h3 < 60 ? m1 + (m2 - m1) * h3 / 60 : h3 < 180 ? m2 : h3 < 240 ? m1 + (m2 - m1) * (240 - h3) / 60 : m1) * 255;
}

// node_modules/d3-color/src/math.js
var radians = Math.PI / 180;
var degrees = 180 / Math.PI;

// node_modules/d3-color/src/lab.js
var K = 18;
var Xn = 0.96422;
var Yn = 1;
var Zn = 0.82521;
var t0 = 4 / 29;
var t1 = 6 / 29;
var t2 = 3 * t1 * t1;
var t3 = t1 * t1 * t1;
function labConvert(o) {
  if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
  if (o instanceof Hcl) return hcl2lab(o);
  if (!(o instanceof Rgb)) o = rgbConvert(o);
  var r = rgb2lrgb(o.r), g = rgb2lrgb(o.g), b = rgb2lrgb(o.b), y2 = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x2, z;
  if (r === g && g === b) x2 = z = y2;
  else {
    x2 = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
    z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
  }
  return new Lab(116 * y2 - 16, 500 * (x2 - y2), 200 * (y2 - z), o.opacity);
}
function lab(l, a, b, opacity) {
  return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
}
function Lab(l, a, b, opacity) {
  this.l = +l;
  this.a = +a;
  this.b = +b;
  this.opacity = +opacity;
}
define_default(Lab, lab, extend(Color, {
  brighter(k) {
    return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  darker(k) {
    return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
  },
  rgb() {
    var y2 = (this.l + 16) / 116, x2 = isNaN(this.a) ? y2 : y2 + this.a / 500, z = isNaN(this.b) ? y2 : y2 - this.b / 200;
    x2 = Xn * lab2xyz(x2);
    y2 = Yn * lab2xyz(y2);
    z = Zn * lab2xyz(z);
    return new Rgb(
      lrgb2rgb(3.1338561 * x2 - 1.6168667 * y2 - 0.4906146 * z),
      lrgb2rgb(-0.9787684 * x2 + 1.9161415 * y2 + 0.033454 * z),
      lrgb2rgb(0.0719453 * x2 - 0.2289914 * y2 + 1.4052427 * z),
      this.opacity
    );
  }
}));
function xyz2lab(t) {
  return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}
function lab2xyz(t) {
  return t > t1 ? t * t * t : t2 * (t - t0);
}
function lrgb2rgb(x2) {
  return 255 * (x2 <= 31308e-7 ? 12.92 * x2 : 1.055 * Math.pow(x2, 1 / 2.4) - 0.055);
}
function rgb2lrgb(x2) {
  return (x2 /= 255) <= 0.04045 ? x2 / 12.92 : Math.pow((x2 + 0.055) / 1.055, 2.4);
}
function hclConvert(o) {
  if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
  if (!(o instanceof Lab)) o = labConvert(o);
  if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0 < o.l && o.l < 100 ? 0 : NaN, o.l, o.opacity);
  var h3 = Math.atan2(o.b, o.a) * degrees;
  return new Hcl(h3 < 0 ? h3 + 360 : h3, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
}
function hcl(h3, c, l, opacity) {
  return arguments.length === 1 ? hclConvert(h3) : new Hcl(h3, c, l, opacity == null ? 1 : opacity);
}
function Hcl(h3, c, l, opacity) {
  this.h = +h3;
  this.c = +c;
  this.l = +l;
  this.opacity = +opacity;
}
function hcl2lab(o) {
  if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
  var h3 = o.h * radians;
  return new Lab(o.l, Math.cos(h3) * o.c, Math.sin(h3) * o.c, o.opacity);
}
define_default(Hcl, hcl, extend(Color, {
  brighter(k) {
    return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
  },
  darker(k) {
    return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
  },
  rgb() {
    return hcl2lab(this).rgb();
  }
}));

// node_modules/d3-interpolate/src/basis.js
function basis(t12, v0, v1, v2, v3) {
  var t22 = t12 * t12, t32 = t22 * t12;
  return ((1 - 3 * t12 + 3 * t22 - t32) * v0 + (4 - 6 * t22 + 3 * t32) * v1 + (1 + 3 * t12 + 3 * t22 - 3 * t32) * v2 + t32 * v3) / 6;
}
function basis_default(values) {
  var n = values.length - 1;
  return function(t) {
    var i = t <= 0 ? t = 0 : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n), v1 = values[i], v2 = values[i + 1], v0 = i > 0 ? values[i - 1] : 2 * v1 - v2, v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/basisClosed.js
function basisClosed_default(values) {
  var n = values.length;
  return function(t) {
    var i = Math.floor(((t %= 1) < 0 ? ++t : t) * n), v0 = values[(i + n - 1) % n], v1 = values[i % n], v2 = values[(i + 1) % n], v3 = values[(i + 2) % n];
    return basis((t - i / n) * n, v0, v1, v2, v3);
  };
}

// node_modules/d3-interpolate/src/constant.js
var constant_default3 = (x2) => () => x2;

// node_modules/d3-interpolate/src/color.js
function linear(a, d) {
  return function(t) {
    return a + t * d;
  };
}
function exponential(a, b, y2) {
  return a = Math.pow(a, y2), b = Math.pow(b, y2) - a, y2 = 1 / y2, function(t) {
    return Math.pow(a + t * b, y2);
  };
}
function hue(a, b) {
  var d = b - a;
  return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant_default3(isNaN(a) ? b : a);
}
function gamma(y2) {
  return (y2 = +y2) === 1 ? nogamma : function(a, b) {
    return b - a ? exponential(a, b, y2) : constant_default3(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant_default3(isNaN(a) ? b : a);
}

// node_modules/d3-interpolate/src/rgb.js
var rgb_default = function rgbGamma(y2) {
  var color2 = gamma(y2);
  function rgb2(start2, end) {
    var r = color2((start2 = rgb(start2)).r, (end = rgb(end)).r), g = color2(start2.g, end.g), b = color2(start2.b, end.b), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.r = r(t);
      start2.g = g(t);
      start2.b = b(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  }
  rgb2.gamma = rgbGamma;
  return rgb2;
}(1);
function rgbSpline(spline) {
  return function(colors) {
    var n = colors.length, r = new Array(n), g = new Array(n), b = new Array(n), i, color2;
    for (i = 0; i < n; ++i) {
      color2 = rgb(colors[i]);
      r[i] = color2.r || 0;
      g[i] = color2.g || 0;
      b[i] = color2.b || 0;
    }
    r = spline(r);
    g = spline(g);
    b = spline(b);
    color2.opacity = 1;
    return function(t) {
      color2.r = r(t);
      color2.g = g(t);
      color2.b = b(t);
      return color2 + "";
    };
  };
}
var rgbBasis = rgbSpline(basis_default);
var rgbBasisClosed = rgbSpline(basisClosed_default);

// node_modules/d3-interpolate/src/numberArray.js
function numberArray_default(a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0, c = b.slice(), i;
  return function(t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}
function isNumberArray(x2) {
  return ArrayBuffer.isView(x2) && !(x2 instanceof DataView);
}

// node_modules/d3-interpolate/src/array.js
function genericArray(a, b) {
  var nb = b ? b.length : 0, na = a ? Math.min(nb, a.length) : 0, x2 = new Array(na), c = new Array(nb), i;
  for (i = 0; i < na; ++i) x2[i] = value_default(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];
  return function(t) {
    for (i = 0; i < na; ++i) c[i] = x2[i](t);
    return c;
  };
}

// node_modules/d3-interpolate/src/date.js
function date_default(a, b) {
  var d = /* @__PURE__ */ new Date();
  return a = +a, b = +b, function(t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

// node_modules/d3-interpolate/src/number.js
function number_default(a, b) {
  return a = +a, b = +b, function(t) {
    return a * (1 - t) + b * t;
  };
}

// node_modules/d3-interpolate/src/object.js
function object_default(a, b) {
  var i = {}, c = {}, k;
  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};
  for (k in b) {
    if (k in a) {
      i[k] = value_default(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }
  return function(t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

// node_modules/d3-interpolate/src/string.js
var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g;
var reB = new RegExp(reA.source, "g");
function zero2(b) {
  return function() {
    return b;
  };
}
function one(b) {
  return function(t) {
    return b(t) + "";
  };
}
function string_default(a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0, am, bm, bs, i = -1, s = [], q = [];
  a = a + "", b = b + "";
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs;
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      if (s[i]) s[i] += bm;
      else s[++i] = bm;
    } else {
      s[++i] = null;
      q.push({ i, x: number_default(am, bm) });
    }
    bi = reB.lastIndex;
  }
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs;
    else s[++i] = bs;
  }
  return s.length < 2 ? q[0] ? one(q[0].x) : zero2(b) : (b = q.length, function(t) {
    for (var i2 = 0, o; i2 < b; ++i2) s[(o = q[i2]).i] = o.x(t);
    return s.join("");
  });
}

// node_modules/d3-interpolate/src/value.js
function value_default(a, b) {
  var t = typeof b, c;
  return b == null || t === "boolean" ? constant_default3(b) : (t === "number" ? number_default : t === "string" ? (c = color(b)) ? (b = c, rgb_default) : string_default : b instanceof color ? rgb_default : b instanceof Date ? date_default : isNumberArray(b) ? numberArray_default : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object_default : number_default)(a, b);
}

// node_modules/d3-interpolate/src/round.js
function round_default(a, b) {
  return a = +a, b = +b, function(t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

// node_modules/d3-interpolate/src/transform/decompose.js
var degrees2 = 180 / Math.PI;
var identity = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose_default(a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees2,
    skewX: Math.atan(skewX) * degrees2,
    scaleX,
    scaleY
  };
}

// node_modules/d3-interpolate/src/transform/parse.js
var svgNode;
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity : decompose_default(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null) return identity;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
  value = value.matrix;
  return decompose_default(value.a, value.b, value.c, value.d, value.e, value.f);
}

// node_modules/d3-interpolate/src/transform/index.js
function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;
      else if (b - a > 180) a += 360;
      q.push({ i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({ i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: number_default(a, b) });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({ i: i - 4, x: number_default(xa, xb) }, { i: i - 2, x: number_default(ya, yb) });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function(a, b) {
    var s = [], q = [];
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null;
    return function(t) {
      var i = -1, n = q.length, o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

// node_modules/d3-interpolate/src/hcl.js
function hcl2(hue2) {
  return function(start2, end) {
    var h3 = hue2((start2 = hcl(start2)).h, (end = hcl(end)).h), c = nogamma(start2.c, end.c), l = nogamma(start2.l, end.l), opacity = nogamma(start2.opacity, end.opacity);
    return function(t) {
      start2.h = h3(t);
      start2.c = c(t);
      start2.l = l(t);
      start2.opacity = opacity(t);
      return start2 + "";
    };
  };
}
var hcl_default = hcl2(hue);
var hclLong = hcl2(nogamma);

// node_modules/d3-timer/src/timer.js
var frame = 0;
var timeout = 0;
var interval = 0;
var pokeDelay = 1e3;
var taskHead;
var taskTail;
var clockLast = 0;
var clockNow = 0;
var clockSkew = 0;
var clock = typeof performance === "object" && performance.now ? performance : Date;
var setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) {
  setTimeout(f, 17);
};
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function(callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;
      else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function() {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now();
  ++frame;
  var t = taskHead, e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(void 0, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now2 = clock.now(), delay = now2 - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now2;
}
function nap() {
  var t02, t12 = taskHead, t22, time = Infinity;
  while (t12) {
    if (t12._call) {
      if (time > t12._time) time = t12._time;
      t02 = t12, t12 = t12._next;
    } else {
      t22 = t12._next, t12._next = null;
      t12 = t02 ? t02._next = t22 : taskHead = t22;
    }
  }
  taskTail = t02;
  sleep(time);
}
function sleep(time) {
  if (frame) return;
  if (timeout) timeout = clearTimeout(timeout);
  var delay = time - clockNow;
  if (delay > 24) {
    if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

// node_modules/d3-timer/src/timeout.js
function timeout_default(callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart((elapsed) => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

// node_modules/d3-transition/src/transition/schedule.js
var emptyOn = dispatch_default("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule_default(node, name, id2, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};
  else if (id2 in schedules) return;
  create(node, id2, {
    name,
    index,
    // For context during callback.
    group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}
function set2(node, id2) {
  var schedule = get2(node, id2);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}
function get2(node, id2) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id2])) throw new Error("transition not found");
  return schedule;
}
function create(node, id2, self) {
  var schedules = node.__transition, tween;
  schedules[id2] = self;
  self.timer = timer(schedule, 0, self.time);
  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start2, self.delay, self.time);
    if (self.delay <= elapsed) start2(elapsed - self.delay);
  }
  function start2(elapsed) {
    var i, j, n, o;
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;
      if (o.state === STARTED) return timeout_default(start2);
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      } else if (+i < id2) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }
    timeout_default(function() {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return;
    self.state = STARTED;
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1), i = -1, n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id2];
    for (var i in schedules) return;
    delete node.__transition;
  }
}

// node_modules/d3-transition/src/interrupt.js
function interrupt_default(node, name) {
  var schedules = node.__transition, schedule, active, empty3 = true, i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty3 = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty3) delete node.__transition;
}

// node_modules/d3-transition/src/selection/interrupt.js
function interrupt_default2(name) {
  return this.each(function() {
    interrupt_default(this, name);
  });
}

// node_modules/d3-transition/src/transition/tween.js
function tweenRemove(id2, name) {
  var tween0, tween1;
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id2, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function() {
    var schedule = set2(this, id2), tween = schedule.tween;
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = { name, value }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule.tween = tween1;
  };
}
function tween_default(name, value) {
  var id2 = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get2(this.node(), id2).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id2, name, value));
}
function tweenValue(transition2, name, value) {
  var id2 = transition2._id;
  transition2.each(function() {
    var schedule = set2(this, id2);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });
  return function(node) {
    return get2(node, id2).value[name];
  };
}

// node_modules/d3-transition/src/transition/interpolate.js
function interpolate_default(a, b) {
  var c;
  return (typeof b === "number" ? number_default : b instanceof color ? rgb_default : (c = color(b)) ? (b = c, rgb_default) : string_default)(a, b);
}

// node_modules/d3-transition/src/transition/attr.js
function attrRemove2(name) {
  return function() {
    this.removeAttribute(name);
  };
}
function attrRemoveNS2(fullname) {
  return function() {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS2(fullname, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS2(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0, value1 = value(this), string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attr_default2(name, value) {
  var fullname = namespace_default(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate_default;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS2 : attrFunction2)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS2 : attrRemove2)(fullname) : (fullname.local ? attrConstantNS2 : attrConstant2)(fullname, i, value));
}

// node_modules/d3-transition/src/transition/attrTween.js
function attrInterpolate(name, i) {
  return function(t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function(t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t02 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t02 = (i0 = i) && attrInterpolate(name, i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function attrTween_default(name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace_default(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

// node_modules/d3-transition/src/transition/delay.js
function delayFunction(id2, value) {
  return function() {
    init(this, id2).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id2, value) {
  return value = +value, function() {
    init(this, id2).delay = value;
  };
}
function delay_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id2, value)) : get2(this.node(), id2).delay;
}

// node_modules/d3-transition/src/transition/duration.js
function durationFunction(id2, value) {
  return function() {
    set2(this, id2).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id2, value) {
  return value = +value, function() {
    set2(this, id2).duration = value;
  };
}
function duration_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id2, value)) : get2(this.node(), id2).duration;
}

// node_modules/d3-transition/src/transition/ease.js
function easeConstant(id2, value) {
  if (typeof value !== "function") throw new Error();
  return function() {
    set2(this, id2).ease = value;
  };
}
function ease_default(value) {
  var id2 = this._id;
  return arguments.length ? this.each(easeConstant(id2, value)) : get2(this.node(), id2).ease;
}

// node_modules/d3-transition/src/transition/easeVarying.js
function easeVarying(id2, value) {
  return function() {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set2(this, id2).ease = v;
  };
}
function easeVarying_default(value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}

// node_modules/d3-transition/src/transition/filter.js
function filter_default2(match) {
  if (typeof match !== "function") match = matcher_default(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/merge.js
function merge_default2(transition2) {
  if (transition2._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition2._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

// node_modules/d3-transition/src/transition/on.js
function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function(t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id2, name, listener) {
  var on0, on1, sit = start(name) ? init : set2;
  return function() {
    var schedule = sit(this, id2), on = schedule.on;
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule.on = on1;
  };
}
function on_default2(name, listener) {
  var id2 = this._id;
  return arguments.length < 2 ? get2(this.node(), id2).on.on(name) : this.each(onFunction(id2, name, listener));
}

// node_modules/d3-transition/src/transition/remove.js
function removeFunction(id2) {
  return function() {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id2) return;
    if (parent) parent.removeChild(this);
  };
}
function remove_default2() {
  return this.on("end.remove", removeFunction(this._id));
}

// node_modules/d3-transition/src/transition/select.js
function select_default3(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function") select = selector_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule_default(subgroup[i], name, id2, i, subgroup, get2(node, id2));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id2);
}

// node_modules/d3-transition/src/transition/selectAll.js
function selectAll_default2(select) {
  var name = this._name, id2 = this._id;
  if (typeof select !== "function") select = selectorAll_default(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children2 = select.call(node, node.__data__, i, group), child, inherit2 = get2(node, id2), k = 0, l = children2.length; k < l; ++k) {
          if (child = children2[k]) {
            schedule_default(child, name, id2, k, children2, inherit2);
          }
        }
        subgroups.push(children2);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id2);
}

// node_modules/d3-transition/src/transition/selection.js
var Selection2 = selection_default.prototype.constructor;
function selection_default2() {
  return new Selection2(this._groups, this._parents);
}

// node_modules/d3-transition/src/transition/style.js
function styleNull(name, interpolate) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove2(name) {
  return function() {
    this.style.removeProperty(name);
  };
}
function styleConstant2(name, interpolate, value1) {
  var string00, string1 = value1 + "", interpolate0;
  return function() {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction2(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function() {
    var string0 = styleValue(this, name), value1 = value(this), string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id2, name) {
  var on0, on1, listener0, key = "style." + name, event = "end." + key, remove2;
  return function() {
    var schedule = set2(this, id2), on = schedule.on, listener = schedule.value[key] == null ? remove2 || (remove2 = styleRemove2(name)) : void 0;
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function style_default2(name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate_default;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove2(name)) : typeof value === "function" ? this.styleTween(name, styleFunction2(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant2(name, i, value), priority).on("end.style." + name, null);
}

// node_modules/d3-transition/src/transition/styleTween.js
function styleInterpolate(name, i, priority) {
  return function(t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function styleTween_default(name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

// node_modules/d3-transition/src/transition/text.js
function textConstant2(value) {
  return function() {
    this.textContent = value;
  };
}
function textFunction2(value) {
  return function() {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function text_default2(value) {
  return this.tween("text", typeof value === "function" ? textFunction2(tweenValue(this, "text", value)) : textConstant2(value == null ? "" : value + ""));
}

// node_modules/d3-transition/src/transition/textTween.js
function textInterpolate(i) {
  return function(t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t02, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t02 = (i0 = i) && textInterpolate(i);
    return t02;
  }
  tween._value = value;
  return tween;
}
function textTween_default(value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}

// node_modules/d3-transition/src/transition/transition.js
function transition_default() {
  var name = this._name, id0 = this._id, id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit2 = get2(node, id0);
        schedule_default(node, name, id1, i, group, {
          time: inherit2.time + inherit2.delay + inherit2.duration,
          delay: 0,
          duration: inherit2.duration,
          ease: inherit2.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}

// node_modules/d3-transition/src/transition/end.js
function end_default() {
  var on0, on1, that = this, id2 = that._id, size = that.size();
  return new Promise(function(resolve, reject) {
    var cancel = { value: reject }, end = { value: function() {
      if (--size === 0) resolve();
    } };
    that.each(function() {
      var schedule = set2(this, id2), on = schedule.on;
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });
    if (size === 0) resolve();
  });
}

// node_modules/d3-transition/src/transition/index.js
var id = 0;
function Transition(groups, parents, name, id2) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id2;
}
function transition(name) {
  return selection_default().transition(name);
}
function newId() {
  return ++id;
}
var selection_prototype = selection_default.prototype;
Transition.prototype = transition.prototype = {
  constructor: Transition,
  select: select_default3,
  selectAll: selectAll_default2,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: filter_default2,
  merge: merge_default2,
  selection: selection_default2,
  transition: transition_default,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: on_default2,
  attr: attr_default2,
  attrTween: attrTween_default,
  style: style_default2,
  styleTween: styleTween_default,
  text: text_default2,
  textTween: textTween_default,
  remove: remove_default2,
  tween: tween_default,
  delay: delay_default,
  duration: duration_default,
  ease: ease_default,
  easeVarying: easeVarying_default,
  end: end_default,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

// node_modules/d3-ease/src/cubic.js
function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

// node_modules/d3-transition/src/selection/transition.js
var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id2) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id2])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id2} not found`);
    }
  }
  return timing;
}
function transition_default2(name) {
  var id2, timing;
  if (name instanceof Transition) {
    id2 = name._id, name = name._name;
  } else {
    id2 = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule_default(node, name, id2, i, group, timing || inherit(node, id2));
      }
    }
  }
  return new Transition(groups, this._parents, name, id2);
}

// node_modules/d3-transition/src/selection/index.js
selection_default.prototype.interrupt = interrupt_default2;
selection_default.prototype.transition = transition_default2;

// node_modules/d3-brush/src/constant.js
var constant_default4 = (x2) => () => x2;

// node_modules/d3-brush/src/event.js
function BrushEvent(type2, {
  sourceEvent,
  target,
  selection: selection2,
  mode,
  dispatch: dispatch2
}) {
  Object.defineProperties(this, {
    type: { value: type2, enumerable: true, configurable: true },
    sourceEvent: { value: sourceEvent, enumerable: true, configurable: true },
    target: { value: target, enumerable: true, configurable: true },
    selection: { value: selection2, enumerable: true, configurable: true },
    mode: { value: mode, enumerable: true, configurable: true },
    _: { value: dispatch2 }
  });
}

// node_modules/d3-brush/src/noevent.js
function nopropagation2(event) {
  event.stopImmediatePropagation();
}
function noevent_default2(event) {
  event.preventDefault();
  event.stopImmediatePropagation();
}

// node_modules/d3-brush/src/brush.js
var MODE_DRAG = { name: "drag" };
var MODE_SPACE = { name: "space" };
var MODE_HANDLE = { name: "handle" };
var MODE_CENTER = { name: "center" };
var { abs, max: max2, min: min2 } = Math;
function number1(e) {
  return [+e[0], +e[1]];
}
function number22(e) {
  return [number1(e[0]), number1(e[1])];
}
var X = {
  name: "x",
  handles: ["w", "e"].map(type),
  input: function(x2, e) {
    return x2 == null ? null : [[+x2[0], e[0][1]], [+x2[1], e[1][1]]];
  },
  output: function(xy) {
    return xy && [xy[0][0], xy[1][0]];
  }
};
var Y = {
  name: "y",
  handles: ["n", "s"].map(type),
  input: function(y2, e) {
    return y2 == null ? null : [[e[0][0], +y2[0]], [e[1][0], +y2[1]]];
  },
  output: function(xy) {
    return xy && [xy[0][1], xy[1][1]];
  }
};
var XY = {
  name: "xy",
  handles: ["n", "w", "e", "s", "nw", "ne", "sw", "se"].map(type),
  input: function(xy) {
    return xy == null ? null : number22(xy);
  },
  output: function(xy) {
    return xy;
  }
};
var cursors = {
  overlay: "crosshair",
  selection: "move",
  n: "ns-resize",
  e: "ew-resize",
  s: "ns-resize",
  w: "ew-resize",
  nw: "nwse-resize",
  ne: "nesw-resize",
  se: "nwse-resize",
  sw: "nesw-resize"
};
var flipX = {
  e: "w",
  w: "e",
  nw: "ne",
  ne: "nw",
  se: "sw",
  sw: "se"
};
var flipY = {
  n: "s",
  s: "n",
  nw: "sw",
  ne: "se",
  se: "ne",
  sw: "nw"
};
var signsX = {
  overlay: 1,
  selection: 1,
  n: null,
  e: 1,
  s: null,
  w: -1,
  nw: -1,
  ne: 1,
  se: 1,
  sw: -1
};
var signsY = {
  overlay: 1,
  selection: 1,
  n: -1,
  e: null,
  s: 1,
  w: null,
  nw: -1,
  ne: -1,
  se: 1,
  sw: 1
};
function type(t) {
  return { type: t };
}
function defaultFilter2(event) {
  return !event.ctrlKey && !event.button;
}
function defaultExtent() {
  var svg = this.ownerSVGElement || this;
  if (svg.hasAttribute("viewBox")) {
    svg = svg.viewBox.baseVal;
    return [[svg.x, svg.y], [svg.x + svg.width, svg.y + svg.height]];
  }
  return [[0, 0], [svg.width.baseVal.value, svg.height.baseVal.value]];
}
function defaultTouchable2() {
  return navigator.maxTouchPoints || "ontouchstart" in this;
}
function local(node) {
  while (!node.__brush) if (!(node = node.parentNode)) return;
  return node.__brush;
}
function empty2(extent2) {
  return extent2[0][0] === extent2[1][0] || extent2[0][1] === extent2[1][1];
}
function brushSelection(node) {
  var state = node.__brush;
  return state ? state.dim.output(state.selection) : null;
}
function brushX() {
  return brush(X);
}
function brush_default() {
  return brush(XY);
}
function brush(dim) {
  var extent2 = defaultExtent, filter2 = defaultFilter2, touchable = defaultTouchable2, keys = true, listeners = dispatch_default("start", "brush", "end"), handleSize = 6, touchending;
  function brush2(group) {
    var overlay = group.property("__brush", initialize).selectAll(".overlay").data([type("overlay")]);
    overlay.enter().append("rect").attr("class", "overlay").attr("pointer-events", "all").attr("cursor", cursors.overlay).merge(overlay).each(function() {
      var extent3 = local(this).extent;
      select_default2(this).attr("x", extent3[0][0]).attr("y", extent3[0][1]).attr("width", extent3[1][0] - extent3[0][0]).attr("height", extent3[1][1] - extent3[0][1]);
    });
    group.selectAll(".selection").data([type("selection")]).enter().append("rect").attr("class", "selection").attr("cursor", cursors.selection).attr("fill", "#777").attr("fill-opacity", 0.3).attr("stroke", "#fff").attr("shape-rendering", "crispEdges");
    var handle = group.selectAll(".handle").data(dim.handles, function(d) {
      return d.type;
    });
    handle.exit().remove();
    handle.enter().append("rect").attr("class", function(d) {
      return "handle handle--" + d.type;
    }).attr("cursor", function(d) {
      return cursors[d.type];
    });
    group.each(redraw).attr("fill", "none").attr("pointer-events", "all").on("mousedown.brush", started).filter(touchable).on("touchstart.brush", started).on("touchmove.brush", touchmoved).on("touchend.brush touchcancel.brush", touchended).style("touch-action", "none").style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
  }
  brush2.move = function(group, selection2, event) {
    if (group.tween) {
      group.on("start.brush", function(event2) {
        emitter(this, arguments).beforestart().start(event2);
      }).on("interrupt.brush end.brush", function(event2) {
        emitter(this, arguments).end(event2);
      }).tween("brush", function() {
        var that = this, state = that.__brush, emit = emitter(that, arguments), selection0 = state.selection, selection1 = dim.input(typeof selection2 === "function" ? selection2.apply(this, arguments) : selection2, state.extent), i = value_default(selection0, selection1);
        function tween(t) {
          state.selection = t === 1 && selection1 === null ? null : i(t);
          redraw.call(that);
          emit.brush();
        }
        return selection0 !== null && selection1 !== null ? tween : tween(1);
      });
    } else {
      group.each(function() {
        var that = this, args = arguments, state = that.__brush, selection1 = dim.input(typeof selection2 === "function" ? selection2.apply(that, args) : selection2, state.extent), emit = emitter(that, args).beforestart();
        interrupt_default(that);
        state.selection = selection1 === null ? null : selection1;
        redraw.call(that);
        emit.start(event).brush(event).end(event);
      });
    }
  };
  brush2.clear = function(group, event) {
    brush2.move(group, null, event);
  };
  function redraw() {
    var group = select_default2(this), selection2 = local(this).selection;
    if (selection2) {
      group.selectAll(".selection").style("display", null).attr("x", selection2[0][0]).attr("y", selection2[0][1]).attr("width", selection2[1][0] - selection2[0][0]).attr("height", selection2[1][1] - selection2[0][1]);
      group.selectAll(".handle").style("display", null).attr("x", function(d) {
        return d.type[d.type.length - 1] === "e" ? selection2[1][0] - handleSize / 2 : selection2[0][0] - handleSize / 2;
      }).attr("y", function(d) {
        return d.type[0] === "s" ? selection2[1][1] - handleSize / 2 : selection2[0][1] - handleSize / 2;
      }).attr("width", function(d) {
        return d.type === "n" || d.type === "s" ? selection2[1][0] - selection2[0][0] + handleSize : handleSize;
      }).attr("height", function(d) {
        return d.type === "e" || d.type === "w" ? selection2[1][1] - selection2[0][1] + handleSize : handleSize;
      });
    } else {
      group.selectAll(".selection,.handle").style("display", "none").attr("x", null).attr("y", null).attr("width", null).attr("height", null);
    }
  }
  function emitter(that, args, clean) {
    var emit = that.__brush.emitter;
    return emit && (!clean || !emit.clean) ? emit : new Emitter(that, args, clean);
  }
  function Emitter(that, args, clean) {
    this.that = that;
    this.args = args;
    this.state = that.__brush;
    this.active = 0;
    this.clean = clean;
  }
  Emitter.prototype = {
    beforestart: function() {
      if (++this.active === 1) this.state.emitter = this, this.starting = true;
      return this;
    },
    start: function(event, mode) {
      if (this.starting) this.starting = false, this.emit("start", event, mode);
      else this.emit("brush", event);
      return this;
    },
    brush: function(event, mode) {
      this.emit("brush", event, mode);
      return this;
    },
    end: function(event, mode) {
      if (--this.active === 0) delete this.state.emitter, this.emit("end", event, mode);
      return this;
    },
    emit: function(type2, event, mode) {
      var d = select_default2(this.that).datum();
      listeners.call(
        type2,
        this.that,
        new BrushEvent(type2, {
          sourceEvent: event,
          target: brush2,
          selection: dim.output(this.state.selection),
          mode,
          dispatch: listeners
        }),
        d
      );
    }
  };
  function started(event) {
    if (touchending && !event.touches) return;
    if (!filter2.apply(this, arguments)) return;
    var that = this, type2 = event.target.__data__.type, mode = (keys && event.metaKey ? type2 = "overlay" : type2) === "selection" ? MODE_DRAG : keys && event.altKey ? MODE_CENTER : MODE_HANDLE, signX = dim === Y ? null : signsX[type2], signY = dim === X ? null : signsY[type2], state = local(that), extent3 = state.extent, selection2 = state.selection, W = extent3[0][0], w0, w1, N = extent3[0][1], n0, n1, E = extent3[1][0], e0, e1, S = extent3[1][1], s0, s1, dx = 0, dy = 0, moving, shifting = signX && signY && keys && event.shiftKey, lockX, lockY, points = Array.from(event.touches || [event], (t) => {
      const i = t.identifier;
      t = pointer_default(t, that);
      t.point0 = t.slice();
      t.identifier = i;
      return t;
    });
    interrupt_default(that);
    var emit = emitter(that, arguments, true).beforestart();
    if (type2 === "overlay") {
      if (selection2) moving = true;
      const pts = [points[0], points[1] || points[0]];
      state.selection = selection2 = [[
        w0 = dim === Y ? W : min2(pts[0][0], pts[1][0]),
        n0 = dim === X ? N : min2(pts[0][1], pts[1][1])
      ], [
        e0 = dim === Y ? E : max2(pts[0][0], pts[1][0]),
        s0 = dim === X ? S : max2(pts[0][1], pts[1][1])
      ]];
      if (points.length > 1) move(event);
    } else {
      w0 = selection2[0][0];
      n0 = selection2[0][1];
      e0 = selection2[1][0];
      s0 = selection2[1][1];
    }
    w1 = w0;
    n1 = n0;
    e1 = e0;
    s1 = s0;
    var group = select_default2(that).attr("pointer-events", "none");
    var overlay = group.selectAll(".overlay").attr("cursor", cursors[type2]);
    if (event.touches) {
      emit.moved = moved;
      emit.ended = ended;
    } else {
      var view = select_default2(event.view).on("mousemove.brush", moved, true).on("mouseup.brush", ended, true);
      if (keys) view.on("keydown.brush", keydowned, true).on("keyup.brush", keyupped, true);
      nodrag_default(event.view);
    }
    redraw.call(that);
    emit.start(event, mode.name);
    function moved(event2) {
      for (const p of event2.changedTouches || [event2]) {
        for (const d of points)
          if (d.identifier === p.identifier) d.cur = pointer_default(p, that);
      }
      if (shifting && !lockX && !lockY && points.length === 1) {
        const point = points[0];
        if (abs(point.cur[0] - point[0]) > abs(point.cur[1] - point[1]))
          lockY = true;
        else
          lockX = true;
      }
      for (const point of points)
        if (point.cur) point[0] = point.cur[0], point[1] = point.cur[1];
      moving = true;
      noevent_default2(event2);
      move(event2);
    }
    function move(event2) {
      const point = points[0], point0 = point.point0;
      var t;
      dx = point[0] - point0[0];
      dy = point[1] - point0[1];
      switch (mode) {
        case MODE_SPACE:
        case MODE_DRAG: {
          if (signX) dx = max2(W - w0, min2(E - e0, dx)), w1 = w0 + dx, e1 = e0 + dx;
          if (signY) dy = max2(N - n0, min2(S - s0, dy)), n1 = n0 + dy, s1 = s0 + dy;
          break;
        }
        case MODE_HANDLE: {
          if (points[1]) {
            if (signX) w1 = max2(W, min2(E, points[0][0])), e1 = max2(W, min2(E, points[1][0])), signX = 1;
            if (signY) n1 = max2(N, min2(S, points[0][1])), s1 = max2(N, min2(S, points[1][1])), signY = 1;
          } else {
            if (signX < 0) dx = max2(W - w0, min2(E - w0, dx)), w1 = w0 + dx, e1 = e0;
            else if (signX > 0) dx = max2(W - e0, min2(E - e0, dx)), w1 = w0, e1 = e0 + dx;
            if (signY < 0) dy = max2(N - n0, min2(S - n0, dy)), n1 = n0 + dy, s1 = s0;
            else if (signY > 0) dy = max2(N - s0, min2(S - s0, dy)), n1 = n0, s1 = s0 + dy;
          }
          break;
        }
        case MODE_CENTER: {
          if (signX) w1 = max2(W, min2(E, w0 - dx * signX)), e1 = max2(W, min2(E, e0 + dx * signX));
          if (signY) n1 = max2(N, min2(S, n0 - dy * signY)), s1 = max2(N, min2(S, s0 + dy * signY));
          break;
        }
      }
      if (e1 < w1) {
        signX *= -1;
        t = w0, w0 = e0, e0 = t;
        t = w1, w1 = e1, e1 = t;
        if (type2 in flipX) overlay.attr("cursor", cursors[type2 = flipX[type2]]);
      }
      if (s1 < n1) {
        signY *= -1;
        t = n0, n0 = s0, s0 = t;
        t = n1, n1 = s1, s1 = t;
        if (type2 in flipY) overlay.attr("cursor", cursors[type2 = flipY[type2]]);
      }
      if (state.selection) selection2 = state.selection;
      if (lockX) w1 = selection2[0][0], e1 = selection2[1][0];
      if (lockY) n1 = selection2[0][1], s1 = selection2[1][1];
      if (selection2[0][0] !== w1 || selection2[0][1] !== n1 || selection2[1][0] !== e1 || selection2[1][1] !== s1) {
        state.selection = [[w1, n1], [e1, s1]];
        redraw.call(that);
        emit.brush(event2, mode.name);
      }
    }
    function ended(event2) {
      nopropagation2(event2);
      if (event2.touches) {
        if (event2.touches.length) return;
        if (touchending) clearTimeout(touchending);
        touchending = setTimeout(function() {
          touchending = null;
        }, 500);
      } else {
        yesdrag(event2.view, moving);
        view.on("keydown.brush keyup.brush mousemove.brush mouseup.brush", null);
      }
      group.attr("pointer-events", "all");
      overlay.attr("cursor", cursors.overlay);
      if (state.selection) selection2 = state.selection;
      if (empty2(selection2)) state.selection = null, redraw.call(that);
      emit.end(event2, mode.name);
    }
    function keydowned(event2) {
      switch (event2.keyCode) {
        case 16: {
          shifting = signX && signY;
          break;
        }
        case 18: {
          if (mode === MODE_HANDLE) {
            if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
            if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
            mode = MODE_CENTER;
            move(event2);
          }
          break;
        }
        case 32: {
          if (mode === MODE_HANDLE || mode === MODE_CENTER) {
            if (signX < 0) e0 = e1 - dx;
            else if (signX > 0) w0 = w1 - dx;
            if (signY < 0) s0 = s1 - dy;
            else if (signY > 0) n0 = n1 - dy;
            mode = MODE_SPACE;
            overlay.attr("cursor", cursors.selection);
            move(event2);
          }
          break;
        }
        default:
          return;
      }
      noevent_default2(event2);
    }
    function keyupped(event2) {
      switch (event2.keyCode) {
        case 16: {
          if (shifting) {
            lockX = lockY = shifting = false;
            move(event2);
          }
          break;
        }
        case 18: {
          if (mode === MODE_CENTER) {
            if (signX < 0) e0 = e1;
            else if (signX > 0) w0 = w1;
            if (signY < 0) s0 = s1;
            else if (signY > 0) n0 = n1;
            mode = MODE_HANDLE;
            move(event2);
          }
          break;
        }
        case 32: {
          if (mode === MODE_SPACE) {
            if (event2.altKey) {
              if (signX) e0 = e1 - dx * signX, w0 = w1 + dx * signX;
              if (signY) s0 = s1 - dy * signY, n0 = n1 + dy * signY;
              mode = MODE_CENTER;
            } else {
              if (signX < 0) e0 = e1;
              else if (signX > 0) w0 = w1;
              if (signY < 0) s0 = s1;
              else if (signY > 0) n0 = n1;
              mode = MODE_HANDLE;
            }
            overlay.attr("cursor", cursors[type2]);
            move(event2);
          }
          break;
        }
        default:
          return;
      }
      noevent_default2(event2);
    }
  }
  function touchmoved(event) {
    emitter(this, arguments).moved(event);
  }
  function touchended(event) {
    emitter(this, arguments).ended(event);
  }
  function initialize() {
    var state = this.__brush || { selection: null };
    state.extent = number22(extent2.apply(this, arguments));
    state.dim = dim;
    return state;
  }
  brush2.extent = function(_) {
    return arguments.length ? (extent2 = typeof _ === "function" ? _ : constant_default4(number22(_)), brush2) : extent2;
  };
  brush2.filter = function(_) {
    return arguments.length ? (filter2 = typeof _ === "function" ? _ : constant_default4(!!_), brush2) : filter2;
  };
  brush2.touchable = function(_) {
    return arguments.length ? (touchable = typeof _ === "function" ? _ : constant_default4(!!_), brush2) : touchable;
  };
  brush2.handleSize = function(_) {
    return arguments.length ? (handleSize = +_, brush2) : handleSize;
  };
  brush2.keyModifiers = function(_) {
    return arguments.length ? (keys = !!_, brush2) : keys;
  };
  brush2.on = function() {
    var value = listeners.on.apply(listeners, arguments);
    return value === listeners ? brush2 : value;
  };
  return brush2;
}

// node_modules/d3-path/src/path.js
var pi = Math.PI;
var tau = 2 * pi;
var epsilon2 = 1e-6;
var tauEpsilon = tau - epsilon2;
function append(strings) {
  this._ += strings[0];
  for (let i = 1, n = strings.length; i < n; ++i) {
    this._ += arguments[i] + strings[i];
  }
}
function appendRound(digits) {
  let d = Math.floor(digits);
  if (!(d >= 0)) throw new Error(`invalid digits: ${digits}`);
  if (d > 15) return append;
  const k = 10 ** d;
  return function(strings) {
    this._ += strings[0];
    for (let i = 1, n = strings.length; i < n; ++i) {
      this._ += Math.round(arguments[i] * k) / k + strings[i];
    }
  };
}
var Path = class {
  constructor(digits) {
    this._x0 = this._y0 = // start of current subpath
    this._x1 = this._y1 = null;
    this._ = "";
    this._append = digits == null ? append : appendRound(digits);
  }
  moveTo(x2, y2) {
    this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}`;
  }
  closePath() {
    if (this._x1 !== null) {
      this._x1 = this._x0, this._y1 = this._y0;
      this._append`Z`;
    }
  }
  lineTo(x2, y2) {
    this._append`L${this._x1 = +x2},${this._y1 = +y2}`;
  }
  quadraticCurveTo(x1, y1, x2, y2) {
    this._append`Q${+x1},${+y1},${this._x1 = +x2},${this._y1 = +y2}`;
  }
  bezierCurveTo(x1, y1, x2, y2, x3, y3) {
    this._append`C${+x1},${+y1},${+x2},${+y2},${this._x1 = +x3},${this._y1 = +y3}`;
  }
  arcTo(x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    if (r < 0) throw new Error(`negative radius: ${r}`);
    let x0 = this._x1, y0 = this._y1, x21 = x2 - x1, y21 = y2 - y1, x01 = x0 - x1, y01 = y0 - y1, l01_2 = x01 * x01 + y01 * y01;
    if (this._x1 === null) {
      this._append`M${this._x1 = x1},${this._y1 = y1}`;
    } else if (!(l01_2 > epsilon2)) ;
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon2) || !r) {
      this._append`L${this._x1 = x1},${this._y1 = y1}`;
    } else {
      let x20 = x2 - x0, y20 = y2 - y0, l21_2 = x21 * x21 + y21 * y21, l20_2 = x20 * x20 + y20 * y20, l21 = Math.sqrt(l21_2), l01 = Math.sqrt(l01_2), l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2), t01 = l / l01, t21 = l / l21;
      if (Math.abs(t01 - 1) > epsilon2) {
        this._append`L${x1 + t01 * x01},${y1 + t01 * y01}`;
      }
      this._append`A${r},${r},0,0,${+(y01 * x20 > x01 * y20)},${this._x1 = x1 + t21 * x21},${this._y1 = y1 + t21 * y21}`;
    }
  }
  arc(x2, y2, r, a0, a1, ccw) {
    x2 = +x2, y2 = +y2, r = +r, ccw = !!ccw;
    if (r < 0) throw new Error(`negative radius: ${r}`);
    let dx = r * Math.cos(a0), dy = r * Math.sin(a0), x0 = x2 + dx, y0 = y2 + dy, cw = 1 ^ ccw, da = ccw ? a0 - a1 : a1 - a0;
    if (this._x1 === null) {
      this._append`M${x0},${y0}`;
    } else if (Math.abs(this._x1 - x0) > epsilon2 || Math.abs(this._y1 - y0) > epsilon2) {
      this._append`L${x0},${y0}`;
    }
    if (!r) return;
    if (da < 0) da = da % tau + tau;
    if (da > tauEpsilon) {
      this._append`A${r},${r},0,1,${cw},${x2 - dx},${y2 - dy}A${r},${r},0,1,${cw},${this._x1 = x0},${this._y1 = y0}`;
    } else if (da > epsilon2) {
      this._append`A${r},${r},0,${+(da >= pi)},${cw},${this._x1 = x2 + r * Math.cos(a1)},${this._y1 = y2 + r * Math.sin(a1)}`;
    }
  }
  rect(x2, y2, w, h3) {
    this._append`M${this._x0 = this._x1 = +x2},${this._y0 = this._y1 = +y2}h${w = +w}v${+h3}h${-w}Z`;
  }
  toString() {
    return this._;
  }
};
function path() {
  return new Path();
}
path.prototype = Path.prototype;

// node_modules/d3-format/src/formatDecimal.js
function formatDecimal_default(x2) {
  return Math.abs(x2 = Math.round(x2)) >= 1e21 ? x2.toLocaleString("en").replace(/,/g, "") : x2.toString(10);
}
function formatDecimalParts(x2, p) {
  if ((i = (x2 = p ? x2.toExponential(p - 1) : x2.toExponential()).indexOf("e")) < 0) return null;
  var i, coefficient = x2.slice(0, i);
  return [
    coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
    +x2.slice(i + 1)
  ];
}

// node_modules/d3-format/src/exponent.js
function exponent_default(x2) {
  return x2 = formatDecimalParts(Math.abs(x2)), x2 ? x2[1] : NaN;
}

// node_modules/d3-format/src/formatGroup.js
function formatGroup_default(grouping, thousands) {
  return function(value, width) {
    var i = value.length, t = [], j = 0, g = grouping[0], length = 0;
    while (i > 0 && g > 0) {
      if (length + g + 1 > width) g = Math.max(1, width - length);
      t.push(value.substring(i -= g, i + g));
      if ((length += g + 1) > width) break;
      g = grouping[j = (j + 1) % grouping.length];
    }
    return t.reverse().join(thousands);
  };
}

// node_modules/d3-format/src/formatNumerals.js
function formatNumerals_default(numerals) {
  return function(value) {
    return value.replace(/[0-9]/g, function(i) {
      return numerals[+i];
    });
  };
}

// node_modules/d3-format/src/formatSpecifier.js
var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;
function formatSpecifier(specifier) {
  if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
  var match;
  return new FormatSpecifier({
    fill: match[1],
    align: match[2],
    sign: match[3],
    symbol: match[4],
    zero: match[5],
    width: match[6],
    comma: match[7],
    precision: match[8] && match[8].slice(1),
    trim: match[9],
    type: match[10]
  });
}
formatSpecifier.prototype = FormatSpecifier.prototype;
function FormatSpecifier(specifier) {
  this.fill = specifier.fill === void 0 ? " " : specifier.fill + "";
  this.align = specifier.align === void 0 ? ">" : specifier.align + "";
  this.sign = specifier.sign === void 0 ? "-" : specifier.sign + "";
  this.symbol = specifier.symbol === void 0 ? "" : specifier.symbol + "";
  this.zero = !!specifier.zero;
  this.width = specifier.width === void 0 ? void 0 : +specifier.width;
  this.comma = !!specifier.comma;
  this.precision = specifier.precision === void 0 ? void 0 : +specifier.precision;
  this.trim = !!specifier.trim;
  this.type = specifier.type === void 0 ? "" : specifier.type + "";
}
FormatSpecifier.prototype.toString = function() {
  return this.fill + this.align + this.sign + this.symbol + (this.zero ? "0" : "") + (this.width === void 0 ? "" : Math.max(1, this.width | 0)) + (this.comma ? "," : "") + (this.precision === void 0 ? "" : "." + Math.max(0, this.precision | 0)) + (this.trim ? "~" : "") + this.type;
};

// node_modules/d3-format/src/formatTrim.js
function formatTrim_default(s) {
  out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
    switch (s[i]) {
      case ".":
        i0 = i1 = i;
        break;
      case "0":
        if (i0 === 0) i0 = i;
        i1 = i;
        break;
      default:
        if (!+s[i]) break out;
        if (i0 > 0) i0 = 0;
        break;
    }
  }
  return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
}

// node_modules/d3-format/src/formatPrefixAuto.js
var prefixExponent;
function formatPrefixAuto_default(x2, p) {
  var d = formatDecimalParts(x2, p);
  if (!d) return x2 + "";
  var coefficient = d[0], exponent = d[1], i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1, n = coefficient.length;
  return i === n ? coefficient : i > n ? coefficient + new Array(i - n + 1).join("0") : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i) : "0." + new Array(1 - i).join("0") + formatDecimalParts(x2, Math.max(0, p + i - 1))[0];
}

// node_modules/d3-format/src/formatRounded.js
function formatRounded_default(x2, p) {
  var d = formatDecimalParts(x2, p);
  if (!d) return x2 + "";
  var coefficient = d[0], exponent = d[1];
  return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1) : coefficient + new Array(exponent - coefficient.length + 2).join("0");
}

// node_modules/d3-format/src/formatTypes.js
var formatTypes_default = {
  "%": (x2, p) => (x2 * 100).toFixed(p),
  "b": (x2) => Math.round(x2).toString(2),
  "c": (x2) => x2 + "",
  "d": formatDecimal_default,
  "e": (x2, p) => x2.toExponential(p),
  "f": (x2, p) => x2.toFixed(p),
  "g": (x2, p) => x2.toPrecision(p),
  "o": (x2) => Math.round(x2).toString(8),
  "p": (x2, p) => formatRounded_default(x2 * 100, p),
  "r": formatRounded_default,
  "s": formatPrefixAuto_default,
  "X": (x2) => Math.round(x2).toString(16).toUpperCase(),
  "x": (x2) => Math.round(x2).toString(16)
};

// node_modules/d3-format/src/identity.js
function identity_default2(x2) {
  return x2;
}

// node_modules/d3-format/src/locale.js
var map = Array.prototype.map;
var prefixes = ["y", "z", "a", "f", "p", "n", "\xB5", "m", "", "k", "M", "G", "T", "P", "E", "Z", "Y"];
function locale_default(locale2) {
  var group = locale2.grouping === void 0 || locale2.thousands === void 0 ? identity_default2 : formatGroup_default(map.call(locale2.grouping, Number), locale2.thousands + ""), currencyPrefix = locale2.currency === void 0 ? "" : locale2.currency[0] + "", currencySuffix = locale2.currency === void 0 ? "" : locale2.currency[1] + "", decimal = locale2.decimal === void 0 ? "." : locale2.decimal + "", numerals = locale2.numerals === void 0 ? identity_default2 : formatNumerals_default(map.call(locale2.numerals, String)), percent = locale2.percent === void 0 ? "%" : locale2.percent + "", minus = locale2.minus === void 0 ? "\u2212" : locale2.minus + "", nan = locale2.nan === void 0 ? "NaN" : locale2.nan + "";
  function newFormat(specifier) {
    specifier = formatSpecifier(specifier);
    var fill = specifier.fill, align = specifier.align, sign = specifier.sign, symbol = specifier.symbol, zero3 = specifier.zero, width = specifier.width, comma = specifier.comma, precision = specifier.precision, trim = specifier.trim, type2 = specifier.type;
    if (type2 === "n") comma = true, type2 = "g";
    else if (!formatTypes_default[type2]) precision === void 0 && (precision = 12), trim = true, type2 = "g";
    if (zero3 || fill === "0" && align === "=") zero3 = true, fill = "0", align = "=";
    var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type2) ? "0" + type2.toLowerCase() : "", suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type2) ? percent : "";
    var formatType = formatTypes_default[type2], maybeSuffix = /[defgprs%]/.test(type2);
    precision = precision === void 0 ? 6 : /[gprs]/.test(type2) ? Math.max(1, Math.min(21, precision)) : Math.max(0, Math.min(20, precision));
    function format2(value) {
      var valuePrefix = prefix, valueSuffix = suffix, i, n, c;
      if (type2 === "c") {
        valueSuffix = formatType(value) + valueSuffix;
        value = "";
      } else {
        value = +value;
        var valueNegative = value < 0 || 1 / value < 0;
        value = isNaN(value) ? nan : formatType(Math.abs(value), precision);
        if (trim) value = formatTrim_default(value);
        if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;
        valuePrefix = (valueNegative ? sign === "(" ? sign : minus : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
        valueSuffix = (type2 === "s" ? prefixes[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");
        if (maybeSuffix) {
          i = -1, n = value.length;
          while (++i < n) {
            if (c = value.charCodeAt(i), 48 > c || c > 57) {
              valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
              value = value.slice(0, i);
              break;
            }
          }
        }
      }
      if (comma && !zero3) value = group(value, Infinity);
      var length = valuePrefix.length + value.length + valueSuffix.length, padding = length < width ? new Array(width - length + 1).join(fill) : "";
      if (comma && zero3) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";
      switch (align) {
        case "<":
          value = valuePrefix + value + valueSuffix + padding;
          break;
        case "=":
          value = valuePrefix + padding + value + valueSuffix;
          break;
        case "^":
          value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length);
          break;
        default:
          value = padding + valuePrefix + value + valueSuffix;
          break;
      }
      return numerals(value);
    }
    format2.toString = function() {
      return specifier + "";
    };
    return format2;
  }
  function formatPrefix2(specifier, value) {
    var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)), e = Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3, k = Math.pow(10, -e), prefix = prefixes[8 + e / 3];
    return function(value2) {
      return f(k * value2) + prefix;
    };
  }
  return {
    format: newFormat,
    formatPrefix: formatPrefix2
  };
}

// node_modules/d3-format/src/defaultLocale.js
var locale;
var format;
var formatPrefix;
defaultLocale({
  thousands: ",",
  grouping: [3],
  currency: ["$", ""]
});
function defaultLocale(definition) {
  locale = locale_default(definition);
  format = locale.format;
  formatPrefix = locale.formatPrefix;
  return locale;
}

// node_modules/d3-format/src/precisionFixed.js
function precisionFixed_default(step) {
  return Math.max(0, -exponent_default(Math.abs(step)));
}

// node_modules/d3-format/src/precisionPrefix.js
function precisionPrefix_default(step, value) {
  return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent_default(value) / 3))) * 3 - exponent_default(Math.abs(step)));
}

// node_modules/d3-format/src/precisionRound.js
function precisionRound_default(step, max3) {
  step = Math.abs(step), max3 = Math.abs(max3) - step;
  return Math.max(0, exponent_default(max3) - exponent_default(step)) + 1;
}

// node_modules/d3-scale/src/init.js
function initRange(domain, range2) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range2).domain(domain);
      break;
  }
  return this;
}

// node_modules/d3-scale/src/constant.js
function constants(x2) {
  return function() {
    return x2;
  };
}

// node_modules/d3-scale/src/number.js
function number3(x2) {
  return +x2;
}

// node_modules/d3-scale/src/continuous.js
var unit = [0, 1];
function identity2(x2) {
  return x2;
}
function normalize(a, b) {
  return (b -= a = +a) ? function(x2) {
    return (x2 - a) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a, b) {
  var t;
  if (a > b) t = a, a = b, b = t;
  return function(x2) {
    return Math.max(a, Math.min(b, x2));
  };
}
function bimap(domain, range2, interpolate) {
  var d0 = domain[0], d1 = domain[1], r0 = range2[0], r1 = range2[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
  else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function(x2) {
    return r0(d0(x2));
  };
}
function polymap(domain, range2, interpolate) {
  var j = Math.min(domain.length, range2.length) - 1, d = new Array(j), r = new Array(j), i = -1;
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range2 = range2.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range2[i], range2[i + 1]);
  }
  return function(x2) {
    var i2 = bisect_default(domain, x2, 1, j) - 1;
    return r[i2](d[i2](x2));
  };
}
function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var domain = unit, range2 = unit, interpolate = value_default, transform2, untransform, unknown, clamp = identity2, piecewise, output, input;
  function rescale() {
    var n = Math.min(domain.length, range2.length);
    if (clamp !== identity2) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x2) {
    return x2 == null || isNaN(x2 = +x2) ? unknown : (output || (output = piecewise(domain.map(transform2), range2, interpolate)))(transform2(clamp(x2)));
  }
  scale.invert = function(y2) {
    return clamp(untransform((input || (input = piecewise(range2, domain.map(transform2), number_default)))(y2)));
  };
  scale.domain = function(_) {
    return arguments.length ? (domain = Array.from(_, number3), rescale()) : domain.slice();
  };
  scale.range = function(_) {
    return arguments.length ? (range2 = Array.from(_), rescale()) : range2.slice();
  };
  scale.rangeRound = function(_) {
    return range2 = Array.from(_), interpolate = round_default, rescale();
  };
  scale.clamp = function(_) {
    return arguments.length ? (clamp = _ ? true : identity2, rescale()) : clamp !== identity2;
  };
  scale.interpolate = function(_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };
  scale.unknown = function(_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function(t, u) {
    transform2 = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer()(identity2, identity2);
}

// node_modules/d3-scale/src/tickFormat.js
function tickFormat(start2, stop, count, specifier) {
  var step = tickStep(start2, stop, count), precision;
  specifier = formatSpecifier(specifier == null ? ",f" : specifier);
  switch (specifier.type) {
    case "s": {
      var value = Math.max(Math.abs(start2), Math.abs(stop));
      if (specifier.precision == null && !isNaN(precision = precisionPrefix_default(step, value))) specifier.precision = precision;
      return formatPrefix(specifier, value);
    }
    case "":
    case "e":
    case "g":
    case "p":
    case "r": {
      if (specifier.precision == null && !isNaN(precision = precisionRound_default(step, Math.max(Math.abs(start2), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
      break;
    }
    case "f":
    case "%": {
      if (specifier.precision == null && !isNaN(precision = precisionFixed_default(step))) specifier.precision = precision - (specifier.type === "%") * 2;
      break;
    }
  }
  return format(specifier);
}

// node_modules/d3-scale/src/linear.js
function linearish(scale) {
  var domain = scale.domain;
  scale.ticks = function(count) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
  };
  scale.tickFormat = function(count, specifier) {
    var d = domain();
    return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
  };
  scale.nice = function(count) {
    if (count == null) count = 10;
    var d = domain();
    var i0 = 0;
    var i1 = d.length - 1;
    var start2 = d[i0];
    var stop = d[i1];
    var prestep;
    var step;
    var maxIter = 10;
    if (stop < start2) {
      step = start2, start2 = stop, stop = step;
      step = i0, i0 = i1, i1 = step;
    }
    while (maxIter-- > 0) {
      step = tickIncrement(start2, stop, count);
      if (step === prestep) {
        d[i0] = start2;
        d[i1] = stop;
        return domain(d);
      } else if (step > 0) {
        start2 = Math.floor(start2 / step) * step;
        stop = Math.ceil(stop / step) * step;
      } else if (step < 0) {
        start2 = Math.ceil(start2 * step) / step;
        stop = Math.floor(stop * step) / step;
      } else {
        break;
      }
      prestep = step;
    }
    return scale;
  };
  return scale;
}
function linear2() {
  var scale = continuous();
  scale.copy = function() {
    return copy(scale, linear2());
  };
  initRange.apply(scale, arguments);
  return linearish(scale);
}

// node_modules/d3-scale/src/nice.js
function nice(domain, interval2) {
  domain = domain.slice();
  var i0 = 0, i1 = domain.length - 1, x0 = domain[i0], x1 = domain[i1], t;
  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }
  domain[i0] = interval2.floor(x0);
  domain[i1] = interval2.ceil(x1);
  return domain;
}

// node_modules/d3-scale/src/log.js
function transformLog(x2) {
  return Math.log(x2);
}
function transformExp(x2) {
  return Math.exp(x2);
}
function transformLogn(x2) {
  return -Math.log(-x2);
}
function transformExpn(x2) {
  return -Math.exp(-x2);
}
function pow10(x2) {
  return isFinite(x2) ? +("1e" + x2) : x2 < 0 ? 0 : x2;
}
function powp(base) {
  return base === 10 ? pow10 : base === Math.E ? Math.exp : (x2) => Math.pow(base, x2);
}
function logp(base) {
  return base === Math.E ? Math.log : base === 10 && Math.log10 || base === 2 && Math.log2 || (base = Math.log(base), (x2) => Math.log(x2) / base);
}
function reflect(f) {
  return (x2, k) => -f(-x2, k);
}
function loggish(transform2) {
  const scale = transform2(transformLog, transformExp);
  const domain = scale.domain;
  let base = 10;
  let logs;
  let pows;
  function rescale() {
    logs = logp(base), pows = powp(base);
    if (domain()[0] < 0) {
      logs = reflect(logs), pows = reflect(pows);
      transform2(transformLogn, transformExpn);
    } else {
      transform2(transformLog, transformExp);
    }
    return scale;
  }
  scale.base = function(_) {
    return arguments.length ? (base = +_, rescale()) : base;
  };
  scale.domain = function(_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.ticks = (count) => {
    const d = domain();
    let u = d[0];
    let v = d[d.length - 1];
    const r = v < u;
    if (r) [u, v] = [v, u];
    let i = logs(u);
    let j = logs(v);
    let k;
    let t;
    const n = count == null ? 10 : +count;
    let z = [];
    if (!(base % 1) && j - i < n) {
      i = Math.floor(i), j = Math.ceil(j);
      if (u > 0) for (; i <= j; ++i) {
        for (k = 1; k < base; ++k) {
          t = i < 0 ? k / pows(-i) : k * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      else for (; i <= j; ++i) {
        for (k = base - 1; k >= 1; --k) {
          t = i > 0 ? k / pows(-i) : k * pows(i);
          if (t < u) continue;
          if (t > v) break;
          z.push(t);
        }
      }
      if (z.length * 2 < n) z = ticks(u, v, n);
    } else {
      z = ticks(i, j, Math.min(j - i, n)).map(pows);
    }
    return r ? z.reverse() : z;
  };
  scale.tickFormat = (count, specifier) => {
    if (count == null) count = 10;
    if (specifier == null) specifier = base === 10 ? "s" : ",";
    if (typeof specifier !== "function") {
      if (!(base % 1) && (specifier = formatSpecifier(specifier)).precision == null) specifier.trim = true;
      specifier = format(specifier);
    }
    if (count === Infinity) return specifier;
    const k = Math.max(1, base * count / scale.ticks().length);
    return (d) => {
      let i = d / pows(Math.round(logs(d)));
      if (i * base < base - 0.5) i *= base;
      return i <= k ? specifier(d) : "";
    };
  };
  scale.nice = () => {
    return domain(nice(domain(), {
      floor: (x2) => pows(Math.floor(logs(x2))),
      ceil: (x2) => pows(Math.ceil(logs(x2)))
    }));
  };
  return scale;
}
function log() {
  const scale = loggish(transformer()).domain([1, 10]);
  scale.copy = () => copy(scale, log()).base(scale.base());
  initRange.apply(scale, arguments);
  return scale;
}

// node_modules/d3-shape/src/constant.js
function constant_default5(x2) {
  return function constant() {
    return x2;
  };
}

// node_modules/d3-shape/src/path.js
function withPath(shape) {
  let digits = 3;
  shape.digits = function(_) {
    if (!arguments.length) return digits;
    if (_ == null) {
      digits = null;
    } else {
      const d = Math.floor(_);
      if (!(d >= 0)) throw new RangeError(`invalid digits: ${_}`);
      digits = d;
    }
    return shape;
  };
  return () => new Path(digits);
}

// node_modules/d3-shape/src/array.js
var slice = Array.prototype.slice;
function array_default(x2) {
  return typeof x2 === "object" && "length" in x2 ? x2 : Array.from(x2);
}

// node_modules/d3-shape/src/curve/linear.js
function Linear(context) {
  this._context = context;
}
Linear.prototype = {
  areaStart: function() {
    this._line = 0;
  },
  areaEnd: function() {
    this._line = NaN;
  },
  lineStart: function() {
    this._point = 0;
  },
  lineEnd: function() {
    if (this._line || this._line !== 0 && this._point === 1) this._context.closePath();
    this._line = 1 - this._line;
  },
  point: function(x2, y2) {
    x2 = +x2, y2 = +y2;
    switch (this._point) {
      case 0:
        this._point = 1;
        this._line ? this._context.lineTo(x2, y2) : this._context.moveTo(x2, y2);
        break;
      case 1:
        this._point = 2;
      // falls through
      default:
        this._context.lineTo(x2, y2);
        break;
    }
  }
};
function linear_default(context) {
  return new Linear(context);
}

// node_modules/d3-shape/src/point.js
function x(p) {
  return p[0];
}
function y(p) {
  return p[1];
}

// node_modules/d3-shape/src/line.js
function line_default(x2, y2) {
  var defined = constant_default5(true), context = null, curve = linear_default, output = null, path2 = withPath(line);
  x2 = typeof x2 === "function" ? x2 : x2 === void 0 ? x : constant_default5(x2);
  y2 = typeof y2 === "function" ? y2 : y2 === void 0 ? y : constant_default5(y2);
  function line(data) {
    var i, n = (data = array_default(data)).length, d, defined0 = false, buffer;
    if (context == null) output = curve(buffer = path2());
    for (i = 0; i <= n; ++i) {
      if (!(i < n && defined(d = data[i], i, data)) === defined0) {
        if (defined0 = !defined0) output.lineStart();
        else output.lineEnd();
      }
      if (defined0) output.point(+x2(d, i, data), +y2(d, i, data));
    }
    if (buffer) return output = null, buffer + "" || null;
  }
  line.x = function(_) {
    return arguments.length ? (x2 = typeof _ === "function" ? _ : constant_default5(+_), line) : x2;
  };
  line.y = function(_) {
    return arguments.length ? (y2 = typeof _ === "function" ? _ : constant_default5(+_), line) : y2;
  };
  line.defined = function(_) {
    return arguments.length ? (defined = typeof _ === "function" ? _ : constant_default5(!!_), line) : defined;
  };
  line.curve = function(_) {
    return arguments.length ? (curve = _, context != null && (output = curve(context)), line) : curve;
  };
  line.context = function(_) {
    return arguments.length ? (_ == null ? context = output = null : output = curve(context = _), line) : context;
  };
  return line;
}

// node_modules/d3-zoom/src/transform.js
function Transform(k, x2, y2) {
  this.k = k;
  this.x = x2;
  this.y = y2;
}
Transform.prototype = {
  constructor: Transform,
  scale: function(k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function(x2, y2) {
    return x2 === 0 & y2 === 0 ? this : new Transform(this.k, this.x + this.k * x2, this.y + this.k * y2);
  },
  apply: function(point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function(x2) {
    return x2 * this.k + this.x;
  },
  applyY: function(y2) {
    return y2 * this.k + this.y;
  },
  invert: function(location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function(x2) {
    return (x2 - this.x) / this.k;
  },
  invertY: function(y2) {
    return (y2 - this.y) / this.k;
  },
  rescaleX: function(x2) {
    return x2.copy().domain(x2.range().map(this.invertX, this).map(x2.invert, x2));
  },
  rescaleY: function(y2) {
    return y2.copy().domain(y2.range().map(this.invertY, this).map(y2.invert, y2));
  },
  toString: function() {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
var identity3 = new Transform(1, 0, 0);
transform.prototype = Transform.prototype;
function transform(node) {
  while (!node.__zoom) if (!(node = node.parentNode)) return identity3;
  return node.__zoom;
}

// node_modules/crossfilter2/src/array.js
var array8 = arrayUntyped;
var array16 = arrayUntyped;
var array32 = arrayUntyped;
var arrayLengthen = arrayLengthenUntyped;
var arrayWiden = arrayWidenUntyped;
if (typeof Uint8Array !== "undefined") {
  array8 = function(n) {
    return new Uint8Array(n);
  };
  array16 = function(n) {
    return new Uint16Array(n);
  };
  array32 = function(n) {
    return new Uint32Array(n);
  };
  arrayLengthen = function(array2, length) {
    if (array2.length >= length) return array2;
    var copy2 = new array2.constructor(length);
    copy2.set(array2);
    return copy2;
  };
  arrayWiden = function(array2, width) {
    var copy2;
    switch (width) {
      case 16:
        copy2 = array16(array2.length);
        break;
      case 32:
        copy2 = array32(array2.length);
        break;
      default:
        throw new Error("invalid array width!");
    }
    copy2.set(array2);
    return copy2;
  };
}
function arrayUntyped(n) {
  var array2 = new Array(n), i = -1;
  while (++i < n) array2[i] = 0;
  return array2;
}
function arrayLengthenUntyped(array2, length) {
  var n = array2.length;
  while (n < length) array2[n++] = 0;
  return array2;
}
function arrayWidenUntyped(array2, width) {
  if (width > 32) throw new Error("invalid array width!");
  return array2;
}
function bitarray(n) {
  this.length = n;
  this.subarrays = 1;
  this.width = 8;
  this.masks = {
    0: 0
  };
  this[0] = array8(n);
}
bitarray.prototype.lengthen = function(n) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    this[i] = arrayLengthen(this[i], n);
  }
  this.length = n;
};
bitarray.prototype.add = function() {
  var m, w, one2, i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    m = this.masks[i];
    w = this.width - 32 * i;
    one2 = (~m & m + 1) >>> 0;
    if (w >= 32 && !one2) {
      continue;
    }
    if (w < 32 && one2 & 1 << w) {
      this[i] = arrayWiden(this[i], w <<= 1);
      this.width = 32 * i + w;
    }
    this.masks[i] |= one2;
    return {
      offset: i,
      one: one2
    };
  }
  this[this.subarrays] = array8(this.length);
  this.masks[this.subarrays] = 1;
  this.width += 8;
  return {
    offset: this.subarrays++,
    one: 1
  };
};
bitarray.prototype.copy = function(dest, src) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    this[i][dest] = this[i][src];
  }
};
bitarray.prototype.truncate = function(n) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    for (var j = this.length - 1; j >= n; j--) {
      this[i][j] = 0;
    }
  }
  this.length = n;
};
bitarray.prototype.zero = function(n) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    if (this[i][n]) {
      return false;
    }
  }
  return true;
};
bitarray.prototype.zeroExcept = function(n, offset, zero3) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    if (i === offset ? this[i][n] & zero3 : this[i][n]) {
      return false;
    }
  }
  return true;
};
bitarray.prototype.zeroExceptMask = function(n, mask) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    if (this[i][n] & mask[i]) {
      return false;
    }
  }
  return true;
};
bitarray.prototype.only = function(n, offset, one2) {
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    if (this[i][n] != (i === offset ? one2 : 0)) {
      return false;
    }
  }
  return true;
};
bitarray.prototype.onlyExcept = function(n, offset, zero3, onlyOffset, onlyOne) {
  var mask;
  var i, len;
  for (i = 0, len = this.subarrays; i < len; ++i) {
    mask = this[i][n];
    if (i === offset)
      mask = (mask & zero3) >>> 0;
    if (mask != (i === onlyOffset ? onlyOne : 0)) {
      return false;
    }
  }
  return true;
};
var array_default2 = {
  array8: arrayUntyped,
  array16: arrayUntyped,
  array32: arrayUntyped,
  arrayLengthen: arrayLengthenUntyped,
  arrayWiden: arrayWidenUntyped,
  bitarray
};

// node_modules/crossfilter2/src/filter.js
var filterExact = (bisect2, value) => {
  return function(values) {
    var n = values.length;
    return [bisect2.left(values, value, 0, n), bisect2.right(values, value, 0, n)];
  };
};
var filterRange = (bisect2, range2) => {
  var min3 = range2[0], max3 = range2[1];
  return function(values) {
    var n = values.length;
    return [bisect2.left(values, min3, 0, n), bisect2.left(values, max3, 0, n)];
  };
};
var filterAll = (values) => {
  return [0, values.length];
};
var filter_default3 = {
  filterExact,
  filterRange,
  filterAll
};

// node_modules/crossfilter2/src/identity.js
var identity_default3 = (d) => {
  return d;
};

// node_modules/crossfilter2/src/null.js
var null_default = () => {
  return null;
};

// node_modules/crossfilter2/src/zero.js
var zero_default = () => {
  return 0;
};

// node_modules/crossfilter2/src/heap.js
function heap_by(f) {
  function heap(a, lo, hi) {
    var n = hi - lo, i = (n >>> 1) + 1;
    while (--i > 0) sift(a, i, n, lo);
    return a;
  }
  function sort(a, lo, hi) {
    var n = hi - lo, t;
    while (--n > 0) t = a[lo], a[lo] = a[lo + n], a[lo + n] = t, sift(a, 1, n, lo);
    return a;
  }
  function sift(a, i, n, lo) {
    var d = a[--lo + i], x2 = f(d), child;
    while ((child = i << 1) <= n) {
      if (child < n && f(a[lo + child]) > f(a[lo + child + 1])) child++;
      if (x2 <= f(a[lo + child])) break;
      a[lo + i] = a[lo + child];
      i = child;
    }
    a[lo + i] = d;
  }
  heap.sort = sort;
  return heap;
}
var h = heap_by(identity_default3);
h.by = heap_by;
var heap_default = h;

// node_modules/crossfilter2/src/heapselect.js
function heapselect_by(f) {
  var heap = heap_default.by(f);
  function heapselect(a, lo, hi, k) {
    var queue = new Array(k = Math.min(hi - lo, k)), min3, i, d;
    for (i = 0; i < k; ++i) queue[i] = a[lo++];
    heap(queue, 0, k);
    if (lo < hi) {
      min3 = f(queue[0]);
      do {
        if (f(d = a[lo]) > min3) {
          queue[0] = d;
          min3 = f(heap(queue, 0, k)[0]);
        }
      } while (++lo < hi);
    }
    return queue;
  }
  return heapselect;
}
var h2 = heapselect_by(identity_default3);
h2.by = heapselect_by;
var heapselect_default = h2;

// node_modules/crossfilter2/src/bisect.js
function bisect_by(f) {
  function bisectLeft2(a, x2, lo, hi) {
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (f(a[mid]) < x2) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }
  function bisectRight2(a, x2, lo, hi) {
    while (lo < hi) {
      var mid = lo + hi >>> 1;
      if (x2 < f(a[mid])) hi = mid;
      else lo = mid + 1;
    }
    return lo;
  }
  bisectRight2.right = bisectRight2;
  bisectRight2.left = bisectLeft2;
  return bisectRight2;
}
var bisect = bisect_by(identity_default3);
bisect.by = bisect_by;
var bisect_default2 = bisect;

// node_modules/crossfilter2/src/permute.js
var permute_default = (array2, index, deep) => {
  for (var i = 0, n = index.length, copy2 = deep ? JSON.parse(JSON.stringify(array2)) : new Array(n); i < n; ++i) {
    copy2[i] = array2[index[i]];
  }
  return copy2;
};

// node_modules/crossfilter2/src/reduce.js
var reduceIncrement = (p) => {
  return p + 1;
};
var reduceDecrement = (p) => {
  return p - 1;
};
var reduceAdd = (f) => {
  return function(p, v) {
    return p + +f(v);
  };
};
var reduceSubtract = (f) => {
  return function(p, v) {
    return p - f(v);
  };
};
var reduce_default = {
  reduceIncrement,
  reduceDecrement,
  reduceAdd,
  reduceSubtract
};

// node_modules/@ranfdev/deepobj/dist/deepobj.m.js
function deepobj_m_default(t, e, i, n, r) {
  for (r in n = (i = i.split(".")).splice(-1, 1), i) e = e[i[r]] = e[i[r]] || {};
  return t(e, n);
}

// node_modules/crossfilter2/src/result.js
var get3 = (obj, prop) => {
  const value = obj[prop];
  return typeof value === "function" ? value.call(obj) : value;
};
var reg = /\[([\w\d]+)\]/g;
var result_default = (obj, path2) => {
  return deepobj_m_default(get3, obj, path2.replace(reg, ".$1"));
};

// node_modules/crossfilter2/src/index.js
var REMOVED_INDEX = -1;
crossfilter.heap = heap_default;
crossfilter.heapselect = heapselect_default;
crossfilter.bisect = bisect_default2;
crossfilter.permute = permute_default;
var src_default = crossfilter;
function crossfilter() {
  var crossfilter2 = {
    add,
    remove: removeData,
    dimension,
    groupAll,
    size,
    all,
    allFiltered,
    onChange,
    isElementFiltered
  };
  var data = [], n = 0, filters, filterListeners = [], dataListeners = [], removeDataListeners = [], callbacks = [];
  filters = new array_default2.bitarray(0);
  function add(newData) {
    var n0 = n, n1 = newData.length;
    if (n1) {
      data = data.concat(newData);
      filters.lengthen(n += n1);
      dataListeners.forEach(function(l) {
        l(newData, n0, n1);
      });
      triggerOnChange("dataAdded");
    }
    return crossfilter2;
  }
  function removeData(predicate) {
    var newIndex = new Array(n), removed = [], usePred = typeof predicate === "function", shouldRemove = function(i) {
      return usePred ? predicate(data[i], i) : filters.zero(i);
    };
    for (var index1 = 0, index2 = 0; index1 < n; ++index1) {
      if (shouldRemove(index1)) {
        removed.push(index1);
        newIndex[index1] = REMOVED_INDEX;
      } else {
        newIndex[index1] = index2++;
      }
    }
    filterListeners.forEach(function(l) {
      l(-1, -1, [], removed, true);
    });
    removeDataListeners.forEach(function(l) {
      l(newIndex);
    });
    for (var index3 = 0, index4 = 0; index3 < n; ++index3) {
      if (newIndex[index3] !== REMOVED_INDEX) {
        if (index3 !== index4) filters.copy(index4, index3), data[index4] = data[index3];
        ++index4;
      }
    }
    data.length = n = index4;
    filters.truncate(index4);
    triggerOnChange("dataRemoved");
  }
  function maskForDimensions(dimensions) {
    var n2, d, len, id2, mask = Array(filters.subarrays);
    for (n2 = 0; n2 < filters.subarrays; n2++) {
      mask[n2] = ~0;
    }
    for (d = 0, len = dimensions.length; d < len; d++) {
      id2 = dimensions[d].id();
      mask[id2 >> 7] &= ~(1 << (id2 & 63));
    }
    return mask;
  }
  function isElementFiltered(i, ignore_dimensions) {
    var mask = maskForDimensions(ignore_dimensions || []);
    return filters.zeroExceptMask(i, mask);
  }
  function dimension(value, iterable) {
    if (typeof value === "string") {
      var accessorPath = value;
      value = function(d) {
        return result_default(d, accessorPath);
      };
    }
    var dimension2 = {
      filter: filter2,
      filterExact: filterExact2,
      filterRange: filterRange2,
      filterFunction,
      filterAll: filterAll2,
      currentFilter,
      hasCurrentFilter,
      top: top2,
      bottom: bottom2,
      group,
      groupAll: groupAll2,
      dispose,
      remove: dispose,
      // for backwards-compatibility
      accessor: value,
      id: function() {
        return id2;
      }
    };
    var one2, zero3, offset, id2, values, index, newValues, newIndex, iterablesIndexCount, iterablesIndexFilterStatus, iterablesEmptyRows = [], sortRange = function(n2) {
      return cr_range(n2).sort(function(A, B) {
        var a = newValues[A], b = newValues[B];
        return a < b ? -1 : a > b ? 1 : A - B;
      });
    }, refilter = filter_default3.filterAll, refilterFunction, filterValue, filterValuePresent, indexListeners = [], dimensionGroups = [], lo0 = 0, hi0 = 0, t = 0, k;
    dataListeners.unshift(preAdd);
    dataListeners.push(postAdd);
    removeDataListeners.push(removeData2);
    var tmp = filters.add();
    offset = tmp.offset;
    one2 = tmp.one;
    zero3 = ~one2;
    id2 = offset << 7 | Math.log(one2) / Math.log(2);
    preAdd(data, 0, n);
    postAdd(data, 0, n);
    function preAdd(newData, n0, n1) {
      var newIterablesIndexCount, newIterablesIndexFilterStatus;
      if (iterable) {
        t = 0;
        j = 0;
        k = [];
        for (var i0 = 0; i0 < newData.length; i0++) {
          for (j = 0, k = value(newData[i0]); j < k.length; j++) {
            t++;
          }
        }
        newValues = [];
        newIterablesIndexCount = cr_range(newData.length);
        newIterablesIndexFilterStatus = cr_index(t, 1);
        var unsortedIndex = cr_range(t);
        for (var l = 0, index1 = 0; index1 < newData.length; index1++) {
          k = value(newData[index1]);
          if (!k.length) {
            newIterablesIndexCount[index1] = 0;
            iterablesEmptyRows.push(index1 + n0);
            continue;
          }
          newIterablesIndexCount[index1] = k.length;
          for (j = 0; j < k.length; j++) {
            newValues.push(k[j]);
            unsortedIndex[l] = index1;
            l++;
          }
        }
        var sortMap = sortRange(t);
        newValues = permute_default(newValues, sortMap);
        newIndex = permute_default(unsortedIndex, sortMap);
      } else {
        newValues = newData.map(value);
        newIndex = sortRange(n1);
        newValues = permute_default(newValues, newIndex);
      }
      var bounds = refilter(newValues), lo1 = bounds[0], hi1 = bounds[1];
      var index2, index3, index4;
      if (iterable) {
        n1 = t;
        if (refilterFunction) {
          for (index2 = 0; index2 < n1; ++index2) {
            if (!refilterFunction(newValues[index2], index2)) {
              if (--newIterablesIndexCount[newIndex[index2]] === 0) {
                filters[offset][newIndex[index2] + n0] |= one2;
              }
              newIterablesIndexFilterStatus[index2] = 1;
            }
          }
        } else {
          for (index3 = 0; index3 < lo1; ++index3) {
            if (--newIterablesIndexCount[newIndex[index3]] === 0) {
              filters[offset][newIndex[index3] + n0] |= one2;
            }
            newIterablesIndexFilterStatus[index3] = 1;
          }
          for (index4 = hi1; index4 < n1; ++index4) {
            if (--newIterablesIndexCount[newIndex[index4]] === 0) {
              filters[offset][newIndex[index4] + n0] |= one2;
            }
            newIterablesIndexFilterStatus[index4] = 1;
          }
        }
      } else {
        if (refilterFunction) {
          for (index2 = 0; index2 < n1; ++index2) {
            if (!refilterFunction(newValues[index2], index2)) {
              filters[offset][newIndex[index2] + n0] |= one2;
            }
          }
        } else {
          for (index3 = 0; index3 < lo1; ++index3) {
            filters[offset][newIndex[index3] + n0] |= one2;
          }
          for (index4 = hi1; index4 < n1; ++index4) {
            filters[offset][newIndex[index4] + n0] |= one2;
          }
        }
      }
      if (!n0) {
        values = newValues;
        index = newIndex;
        iterablesIndexCount = newIterablesIndexCount;
        iterablesIndexFilterStatus = newIterablesIndexFilterStatus;
        lo0 = lo1;
        hi0 = hi1;
        return;
      }
      var oldValues = values, oldIndex = index, oldIterablesIndexFilterStatus = iterablesIndexFilterStatus, old_n0, i1 = 0;
      i0 = 0;
      if (iterable) {
        old_n0 = n0;
        n0 = oldValues.length;
        n1 = t;
      }
      values = iterable ? new Array(n0 + n1) : new Array(n);
      index = iterable ? new Array(n0 + n1) : cr_index(n, n);
      if (iterable) iterablesIndexFilterStatus = cr_index(n0 + n1, 1);
      if (iterable) {
        var oldiiclength = iterablesIndexCount.length;
        iterablesIndexCount = array_default2.arrayLengthen(iterablesIndexCount, n);
        for (var j = 0; j + oldiiclength < n; j++) {
          iterablesIndexCount[j + oldiiclength] = newIterablesIndexCount[j];
        }
      }
      var index5 = 0;
      for (; i0 < n0 && i1 < n1; ++index5) {
        if (oldValues[i0] < newValues[i1]) {
          values[index5] = oldValues[i0];
          if (iterable) iterablesIndexFilterStatus[index5] = oldIterablesIndexFilterStatus[i0];
          index[index5] = oldIndex[i0++];
        } else {
          values[index5] = newValues[i1];
          if (iterable) iterablesIndexFilterStatus[index5] = newIterablesIndexFilterStatus[i1];
          index[index5] = newIndex[i1++] + (iterable ? old_n0 : n0);
        }
      }
      for (; i0 < n0; ++i0, ++index5) {
        values[index5] = oldValues[i0];
        if (iterable) iterablesIndexFilterStatus[index5] = oldIterablesIndexFilterStatus[i0];
        index[index5] = oldIndex[i0];
      }
      for (; i1 < n1; ++i1, ++index5) {
        values[index5] = newValues[i1];
        if (iterable) iterablesIndexFilterStatus[index5] = newIterablesIndexFilterStatus[i1];
        index[index5] = newIndex[i1] + (iterable ? old_n0 : n0);
      }
      bounds = refilter(values), lo0 = bounds[0], hi0 = bounds[1];
    }
    function postAdd(newData, n0, n1) {
      indexListeners.forEach(function(l) {
        l(newValues, newIndex, n0, n1);
      });
      newValues = newIndex = null;
    }
    function removeData2(reIndex) {
      if (iterable) {
        for (var i0 = 0, i1 = 0; i0 < iterablesEmptyRows.length; i0++) {
          if (reIndex[iterablesEmptyRows[i0]] !== REMOVED_INDEX) {
            iterablesEmptyRows[i1] = reIndex[iterablesEmptyRows[i0]];
            i1++;
          }
        }
        iterablesEmptyRows.length = i1;
        for (i0 = 0, i1 = 0; i0 < n; i0++) {
          if (reIndex[i0] !== REMOVED_INDEX) {
            if (i1 !== i0) iterablesIndexCount[i1] = iterablesIndexCount[i0];
            i1++;
          }
        }
        iterablesIndexCount = iterablesIndexCount.slice(0, i1);
      }
      var n0 = values.length;
      for (var i = 0, j = 0, oldDataIndex; i < n0; ++i) {
        oldDataIndex = index[i];
        if (reIndex[oldDataIndex] !== REMOVED_INDEX) {
          if (i !== j) values[j] = values[i];
          index[j] = reIndex[oldDataIndex];
          if (iterable) {
            iterablesIndexFilterStatus[j] = iterablesIndexFilterStatus[i];
          }
          ++j;
        }
      }
      values.length = j;
      if (iterable) iterablesIndexFilterStatus = iterablesIndexFilterStatus.slice(0, j);
      while (j < n0) index[j++] = 0;
      var bounds = refilter(values);
      lo0 = bounds[0], hi0 = bounds[1];
    }
    function filterIndexBounds(bounds) {
      var lo1 = bounds[0], hi1 = bounds[1];
      if (refilterFunction) {
        refilterFunction = null;
        filterIndexFunction(function(d, i2) {
          return lo1 <= i2 && i2 < hi1;
        }, bounds[0] === 0 && bounds[1] === values.length);
        lo0 = lo1;
        hi0 = hi1;
        return dimension2;
      }
      var i, j, k2, added = [], removed = [], valueIndexAdded = [], valueIndexRemoved = [];
      if (lo1 < lo0) {
        for (i = lo1, j = Math.min(lo0, hi1); i < j; ++i) {
          added.push(index[i]);
          valueIndexAdded.push(i);
        }
      } else if (lo1 > lo0) {
        for (i = lo0, j = Math.min(lo1, hi0); i < j; ++i) {
          removed.push(index[i]);
          valueIndexRemoved.push(i);
        }
      }
      if (hi1 > hi0) {
        for (i = Math.max(lo1, hi0), j = hi1; i < j; ++i) {
          added.push(index[i]);
          valueIndexAdded.push(i);
        }
      } else if (hi1 < hi0) {
        for (i = Math.max(lo0, hi1), j = hi0; i < j; ++i) {
          removed.push(index[i]);
          valueIndexRemoved.push(i);
        }
      }
      if (!iterable) {
        for (i = 0; i < added.length; i++) {
          filters[offset][added[i]] ^= one2;
        }
        for (i = 0; i < removed.length; i++) {
          filters[offset][removed[i]] ^= one2;
        }
      } else {
        var newAdded = [];
        var newRemoved = [];
        for (i = 0; i < added.length; i++) {
          iterablesIndexCount[added[i]]++;
          iterablesIndexFilterStatus[valueIndexAdded[i]] = 0;
          if (iterablesIndexCount[added[i]] === 1) {
            filters[offset][added[i]] ^= one2;
            newAdded.push(added[i]);
          }
        }
        for (i = 0; i < removed.length; i++) {
          iterablesIndexCount[removed[i]]--;
          iterablesIndexFilterStatus[valueIndexRemoved[i]] = 1;
          if (iterablesIndexCount[removed[i]] === 0) {
            filters[offset][removed[i]] ^= one2;
            newRemoved.push(removed[i]);
          }
        }
        added = newAdded;
        removed = newRemoved;
        if (refilter === filter_default3.filterAll) {
          for (i = 0; i < iterablesEmptyRows.length; i++) {
            if (filters[offset][k2 = iterablesEmptyRows[i]] & one2) {
              filters[offset][k2] ^= one2;
              added.push(k2);
            }
          }
        } else {
          for (i = 0; i < iterablesEmptyRows.length; i++) {
            if (!(filters[offset][k2 = iterablesEmptyRows[i]] & one2)) {
              filters[offset][k2] ^= one2;
              removed.push(k2);
            }
          }
        }
      }
      lo0 = lo1;
      hi0 = hi1;
      filterListeners.forEach(function(l) {
        l(one2, offset, added, removed);
      });
      triggerOnChange("filtered");
      return dimension2;
    }
    function filter2(range2) {
      return range2 == null ? filterAll2() : Array.isArray(range2) ? filterRange2(range2) : typeof range2 === "function" ? filterFunction(range2) : filterExact2(range2);
    }
    function filterExact2(value2) {
      filterValue = value2;
      filterValuePresent = true;
      return filterIndexBounds((refilter = filter_default3.filterExact(bisect_default2, value2))(values));
    }
    function filterRange2(range2) {
      filterValue = range2;
      filterValuePresent = true;
      return filterIndexBounds((refilter = filter_default3.filterRange(bisect_default2, range2))(values));
    }
    function filterAll2() {
      filterValue = void 0;
      filterValuePresent = false;
      return filterIndexBounds((refilter = filter_default3.filterAll)(values));
    }
    function filterFunction(f) {
      filterValue = f;
      filterValuePresent = true;
      refilterFunction = f;
      refilter = filter_default3.filterAll;
      filterIndexFunction(f, false);
      var bounds = refilter(values);
      lo0 = bounds[0], hi0 = bounds[1];
      return dimension2;
    }
    function filterIndexFunction(f, filterAll3) {
      var i, k2, x2, added = [], removed = [], valueIndexAdded = [], valueIndexRemoved = [], indexLength = values.length;
      if (!iterable) {
        for (i = 0; i < indexLength; ++i) {
          if (!(filters[offset][k2 = index[i]] & one2) ^ !!(x2 = f(values[i], i))) {
            if (x2) added.push(k2);
            else removed.push(k2);
          }
        }
      }
      if (iterable) {
        for (i = 0; i < indexLength; ++i) {
          if (f(values[i], i)) {
            added.push(index[i]);
            valueIndexAdded.push(i);
          } else {
            removed.push(index[i]);
            valueIndexRemoved.push(i);
          }
        }
      }
      if (!iterable) {
        for (i = 0; i < added.length; i++) {
          if (filters[offset][added[i]] & one2) filters[offset][added[i]] &= zero3;
        }
        for (i = 0; i < removed.length; i++) {
          if (!(filters[offset][removed[i]] & one2)) filters[offset][removed[i]] |= one2;
        }
      } else {
        var newAdded = [];
        var newRemoved = [];
        for (i = 0; i < added.length; i++) {
          if (iterablesIndexFilterStatus[valueIndexAdded[i]] === 1) {
            iterablesIndexCount[added[i]]++;
            iterablesIndexFilterStatus[valueIndexAdded[i]] = 0;
            if (iterablesIndexCount[added[i]] === 1) {
              filters[offset][added[i]] ^= one2;
              newAdded.push(added[i]);
            }
          }
        }
        for (i = 0; i < removed.length; i++) {
          if (iterablesIndexFilterStatus[valueIndexRemoved[i]] === 0) {
            iterablesIndexCount[removed[i]]--;
            iterablesIndexFilterStatus[valueIndexRemoved[i]] = 1;
            if (iterablesIndexCount[removed[i]] === 0) {
              filters[offset][removed[i]] ^= one2;
              newRemoved.push(removed[i]);
            }
          }
        }
        added = newAdded;
        removed = newRemoved;
        if (filterAll3) {
          for (i = 0; i < iterablesEmptyRows.length; i++) {
            if (filters[offset][k2 = iterablesEmptyRows[i]] & one2) {
              filters[offset][k2] ^= one2;
              added.push(k2);
            }
          }
        } else {
          for (i = 0; i < iterablesEmptyRows.length; i++) {
            if (!(filters[offset][k2 = iterablesEmptyRows[i]] & one2)) {
              filters[offset][k2] ^= one2;
              removed.push(k2);
            }
          }
        }
      }
      filterListeners.forEach(function(l) {
        l(one2, offset, added, removed);
      });
      triggerOnChange("filtered");
    }
    function currentFilter() {
      return filterValue;
    }
    function hasCurrentFilter() {
      return filterValuePresent;
    }
    function top2(k2, top_offset) {
      var array2 = [], i = hi0, j, toSkip = 0;
      if (top_offset && top_offset > 0) toSkip = top_offset;
      while (--i >= lo0 && k2 > 0) {
        if (filters.zero(j = index[i])) {
          if (toSkip > 0) {
            --toSkip;
          } else {
            array2.push(data[j]);
            --k2;
          }
        }
      }
      if (iterable) {
        for (i = 0; i < iterablesEmptyRows.length && k2 > 0; i++) {
          if (filters.zero(j = iterablesEmptyRows[i])) {
            if (toSkip > 0) {
              --toSkip;
            } else {
              array2.push(data[j]);
              --k2;
            }
          }
        }
      }
      return array2;
    }
    function bottom2(k2, bottom_offset) {
      var array2 = [], i, j, toSkip = 0;
      if (bottom_offset && bottom_offset > 0) toSkip = bottom_offset;
      if (iterable) {
        for (i = 0; i < iterablesEmptyRows.length && k2 > 0; i++) {
          if (filters.zero(j = iterablesEmptyRows[i])) {
            if (toSkip > 0) {
              --toSkip;
            } else {
              array2.push(data[j]);
              --k2;
            }
          }
        }
      }
      i = lo0;
      while (i < hi0 && k2 > 0) {
        if (filters.zero(j = index[i])) {
          if (toSkip > 0) {
            --toSkip;
          } else {
            array2.push(data[j]);
            --k2;
          }
        }
        i++;
      }
      return array2;
    }
    function group(key) {
      var group2 = {
        top: top3,
        all: all2,
        reduce,
        reduceCount,
        reduceSum,
        order,
        orderNatural,
        size: size2,
        dispose: dispose2,
        remove: dispose2
        // for backwards-compatibility
      };
      dimensionGroups.push(group2);
      var groups, groupIndex, groupWidth = 8, groupCapacity = capacity(groupWidth), k2 = 0, select, heap, reduceAdd2, reduceRemove, reduceInitial, update = null_default, reset = null_default, resetNeeded = true, groupAll3 = key === null_default, n0old;
      if (arguments.length < 1) key = identity_default3;
      filterListeners.push(update);
      indexListeners.push(add2);
      removeDataListeners.push(removeData3);
      add2(values, index, 0, n);
      function add2(newValues2, newIndex2, n0, n1) {
        if (iterable) {
          n0old = n0;
          n0 = values.length - newValues2.length;
          n1 = newValues2.length;
        }
        var oldGroups = groups, reIndex = iterable ? [] : cr_index(k2, groupCapacity), add3 = reduceAdd2, remove2 = reduceRemove, initial = reduceInitial, k0 = k2, i0 = 0, i1 = 0, j, g0, x0, x1, g, x2;
        if (resetNeeded) add3 = initial = null_default;
        if (resetNeeded) remove2 = initial = null_default;
        groups = new Array(k2), k2 = 0;
        if (iterable) {
          groupIndex = k0 ? groupIndex : [];
        } else {
          groupIndex = k0 > 1 ? array_default2.arrayLengthen(groupIndex, n) : cr_index(n, groupCapacity);
        }
        if (k0) x0 = (g0 = oldGroups[0]).key;
        while (i1 < n1 && !((x1 = key(newValues2[i1])) >= x1)) ++i1;
        while (i1 < n1) {
          if (g0 && x0 <= x1) {
            g = g0, x2 = x0;
            reIndex[i0] = k2;
            g0 = oldGroups[++i0];
            if (g0) x0 = g0.key;
          } else {
            g = { key: x1, value: initial() }, x2 = x1;
          }
          groups[k2] = g;
          while (x1 <= x2) {
            j = newIndex2[i1] + (iterable ? n0old : n0);
            if (iterable) {
              if (groupIndex[j]) {
                groupIndex[j].push(k2);
              } else {
                groupIndex[j] = [k2];
              }
            } else {
              groupIndex[j] = k2;
            }
            g.value = add3(g.value, data[j], true);
            if (!filters.zeroExcept(j, offset, zero3)) g.value = remove2(g.value, data[j], false);
            if (++i1 >= n1) break;
            x1 = key(newValues2[i1]);
          }
          groupIncrement();
        }
        while (i0 < k0) {
          groups[reIndex[i0] = k2] = oldGroups[i0++];
          groupIncrement();
        }
        if (iterable) {
          for (var index1 = 0; index1 < n; index1++) {
            if (!groupIndex[index1]) {
              groupIndex[index1] = [];
            }
          }
        }
        if (k2 > i0) {
          if (iterable) {
            for (i0 = 0; i0 < n0old; ++i0) {
              for (index1 = 0; index1 < groupIndex[i0].length; index1++) {
                groupIndex[i0][index1] = reIndex[groupIndex[i0][index1]];
              }
            }
          } else {
            for (i0 = 0; i0 < n0; ++i0) {
              groupIndex[i0] = reIndex[groupIndex[i0]];
            }
          }
        }
        j = filterListeners.indexOf(update);
        if (k2 > 1 || iterable) {
          update = updateMany;
          reset = resetMany;
        } else {
          if (!k2 && groupAll3) {
            k2 = 1;
            groups = [{ key: null, value: initial() }];
          }
          if (k2 === 1) {
            update = updateOne;
            reset = resetOne;
          } else {
            update = null_default;
            reset = null_default;
          }
          groupIndex = null;
        }
        filterListeners[j] = update;
        function groupIncrement() {
          if (iterable) {
            k2++;
            return;
          }
          if (++k2 === groupCapacity) {
            reIndex = array_default2.arrayWiden(reIndex, groupWidth <<= 1);
            groupIndex = array_default2.arrayWiden(groupIndex, groupWidth);
            groupCapacity = capacity(groupWidth);
          }
        }
      }
      function removeData3(reIndex) {
        if (k2 > 1 || iterable) {
          var oldK = k2, oldGroups = groups, seenGroups = cr_index(oldK, oldK), i, i0, j;
          if (!iterable) {
            for (i = 0, j = 0; i < n; ++i) {
              if (reIndex[i] !== REMOVED_INDEX) {
                seenGroups[groupIndex[j] = groupIndex[i]] = 1;
                ++j;
              }
            }
          } else {
            for (i = 0, j = 0; i < n; ++i) {
              if (reIndex[i] !== REMOVED_INDEX) {
                groupIndex[j] = groupIndex[i];
                for (i0 = 0; i0 < groupIndex[j].length; i0++) {
                  seenGroups[groupIndex[j][i0]] = 1;
                }
                ++j;
              }
            }
            groupIndex = groupIndex.slice(0, j);
          }
          groups = [], k2 = 0;
          for (i = 0; i < oldK; ++i) {
            if (seenGroups[i]) {
              seenGroups[i] = k2++;
              groups.push(oldGroups[i]);
            }
          }
          if (k2 > 1 || iterable) {
            if (!iterable) {
              for (i = 0; i < j; ++i) groupIndex[i] = seenGroups[groupIndex[i]];
            } else {
              for (i = 0; i < j; ++i) {
                for (i0 = 0; i0 < groupIndex[i].length; ++i0) {
                  groupIndex[i][i0] = seenGroups[groupIndex[i][i0]];
                }
              }
            }
          } else {
            groupIndex = null;
          }
          filterListeners[filterListeners.indexOf(update)] = k2 > 1 || iterable ? (reset = resetMany, update = updateMany) : k2 === 1 ? (reset = resetOne, update = updateOne) : reset = update = null_default;
        } else if (k2 === 1) {
          if (groupAll3) return;
          for (var index3 = 0; index3 < n; ++index3) if (reIndex[index3] !== REMOVED_INDEX) return;
          groups = [], k2 = 0;
          filterListeners[filterListeners.indexOf(update)] = update = reset = null_default;
        }
      }
      function updateMany(filterOne, filterOffset, added, removed, notFilter) {
        if (filterOne === one2 && filterOffset === offset || resetNeeded) return;
        var i, j, k3, n2, g;
        if (iterable) {
          for (i = 0, n2 = added.length; i < n2; ++i) {
            if (filters.zeroExcept(k3 = added[i], offset, zero3)) {
              for (j = 0; j < groupIndex[k3].length; j++) {
                g = groups[groupIndex[k3][j]];
                g.value = reduceAdd2(g.value, data[k3], false, j);
              }
            }
          }
          for (i = 0, n2 = removed.length; i < n2; ++i) {
            if (filters.onlyExcept(k3 = removed[i], offset, zero3, filterOffset, filterOne)) {
              for (j = 0; j < groupIndex[k3].length; j++) {
                g = groups[groupIndex[k3][j]];
                g.value = reduceRemove(g.value, data[k3], notFilter, j);
              }
            }
          }
          return;
        }
        for (i = 0, n2 = added.length; i < n2; ++i) {
          if (filters.zeroExcept(k3 = added[i], offset, zero3)) {
            g = groups[groupIndex[k3]];
            g.value = reduceAdd2(g.value, data[k3], false);
          }
        }
        for (i = 0, n2 = removed.length; i < n2; ++i) {
          if (filters.onlyExcept(k3 = removed[i], offset, zero3, filterOffset, filterOne)) {
            g = groups[groupIndex[k3]];
            g.value = reduceRemove(g.value, data[k3], notFilter);
          }
        }
      }
      function updateOne(filterOne, filterOffset, added, removed, notFilter) {
        if (filterOne === one2 && filterOffset === offset || resetNeeded) return;
        var i, k3, n2, g = groups[0];
        for (i = 0, n2 = added.length; i < n2; ++i) {
          if (filters.zeroExcept(k3 = added[i], offset, zero3)) {
            g.value = reduceAdd2(g.value, data[k3], false);
          }
        }
        for (i = 0, n2 = removed.length; i < n2; ++i) {
          if (filters.onlyExcept(k3 = removed[i], offset, zero3, filterOffset, filterOne)) {
            g.value = reduceRemove(g.value, data[k3], notFilter);
          }
        }
      }
      function resetMany() {
        var i, j, g;
        for (i = 0; i < k2; ++i) {
          groups[i].value = reduceInitial();
        }
        if (iterable) {
          for (i = 0; i < n; ++i) {
            for (j = 0; j < groupIndex[i].length; j++) {
              g = groups[groupIndex[i][j]];
              g.value = reduceAdd2(g.value, data[i], true, j);
            }
          }
          for (i = 0; i < n; ++i) {
            if (!filters.zeroExcept(i, offset, zero3)) {
              for (j = 0; j < groupIndex[i].length; j++) {
                g = groups[groupIndex[i][j]];
                g.value = reduceRemove(g.value, data[i], false, j);
              }
            }
          }
          return;
        }
        for (i = 0; i < n; ++i) {
          g = groups[groupIndex[i]];
          g.value = reduceAdd2(g.value, data[i], true);
        }
        for (i = 0; i < n; ++i) {
          if (!filters.zeroExcept(i, offset, zero3)) {
            g = groups[groupIndex[i]];
            g.value = reduceRemove(g.value, data[i], false);
          }
        }
      }
      function resetOne() {
        var i, g = groups[0];
        g.value = reduceInitial();
        for (i = 0; i < n; ++i) {
          g.value = reduceAdd2(g.value, data[i], true);
        }
        for (i = 0; i < n; ++i) {
          if (!filters.zeroExcept(i, offset, zero3)) {
            g.value = reduceRemove(g.value, data[i], false);
          }
        }
      }
      function all2() {
        if (resetNeeded) reset(), resetNeeded = false;
        return groups;
      }
      function top3(k3) {
        var top4 = select(all2(), 0, groups.length, k3);
        return heap.sort(top4, 0, top4.length);
      }
      function reduce(add3, remove2, initial) {
        reduceAdd2 = add3;
        reduceRemove = remove2;
        reduceInitial = initial;
        resetNeeded = true;
        return group2;
      }
      function reduceCount() {
        return reduce(reduce_default.reduceIncrement, reduce_default.reduceDecrement, zero_default);
      }
      function reduceSum(value2) {
        return reduce(reduce_default.reduceAdd(value2), reduce_default.reduceSubtract(value2), zero_default);
      }
      function order(value2) {
        select = heapselect_default.by(valueOf);
        heap = heap_default.by(valueOf);
        function valueOf(d) {
          return value2(d.value);
        }
        return group2;
      }
      function orderNatural() {
        return order(identity_default3);
      }
      function size2() {
        return k2;
      }
      function dispose2() {
        var i = filterListeners.indexOf(update);
        if (i >= 0) filterListeners.splice(i, 1);
        i = indexListeners.indexOf(add2);
        if (i >= 0) indexListeners.splice(i, 1);
        i = removeDataListeners.indexOf(removeData3);
        if (i >= 0) removeDataListeners.splice(i, 1);
        i = dimensionGroups.indexOf(group2);
        if (i >= 0) dimensionGroups.splice(i, 1);
        return group2;
      }
      return reduceCount().orderNatural();
    }
    function groupAll2() {
      var g = group(null_default), all2 = g.all;
      delete g.all;
      delete g.top;
      delete g.order;
      delete g.orderNatural;
      delete g.size;
      g.value = function() {
        return all2()[0].value;
      };
      return g;
    }
    function dispose() {
      dimensionGroups.forEach(function(group2) {
        group2.dispose();
      });
      var i = dataListeners.indexOf(preAdd);
      if (i >= 0) dataListeners.splice(i, 1);
      i = dataListeners.indexOf(postAdd);
      if (i >= 0) dataListeners.splice(i, 1);
      i = removeDataListeners.indexOf(removeData2);
      if (i >= 0) removeDataListeners.splice(i, 1);
      filters.masks[offset] &= zero3;
      return filterAll2();
    }
    return dimension2;
  }
  function groupAll() {
    var group = {
      reduce,
      reduceCount,
      reduceSum,
      value,
      dispose,
      remove: dispose
      // for backwards-compatibility
    };
    var reduceValue, reduceAdd2, reduceRemove, reduceInitial, resetNeeded = true;
    filterListeners.push(update);
    dataListeners.push(add2);
    add2(data, 0, n);
    function add2(newData, n0) {
      var i;
      if (resetNeeded) return;
      for (i = n0; i < n; ++i) {
        reduceValue = reduceAdd2(reduceValue, data[i], true);
        if (!filters.zero(i)) {
          reduceValue = reduceRemove(reduceValue, data[i], false);
        }
      }
    }
    function update(filterOne, filterOffset, added, removed, notFilter) {
      var i, k, n2;
      if (resetNeeded) return;
      for (i = 0, n2 = added.length; i < n2; ++i) {
        if (filters.zero(k = added[i])) {
          reduceValue = reduceAdd2(reduceValue, data[k], notFilter);
        }
      }
      for (i = 0, n2 = removed.length; i < n2; ++i) {
        if (filters.only(k = removed[i], filterOffset, filterOne)) {
          reduceValue = reduceRemove(reduceValue, data[k], notFilter);
        }
      }
    }
    function reset() {
      var i;
      reduceValue = reduceInitial();
      for (i = 0; i < n; ++i) {
        reduceValue = reduceAdd2(reduceValue, data[i], true);
        if (!filters.zero(i)) {
          reduceValue = reduceRemove(reduceValue, data[i], false);
        }
      }
    }
    function reduce(add3, remove2, initial) {
      reduceAdd2 = add3;
      reduceRemove = remove2;
      reduceInitial = initial;
      resetNeeded = true;
      return group;
    }
    function reduceCount() {
      return reduce(reduce_default.reduceIncrement, reduce_default.reduceDecrement, zero_default);
    }
    function reduceSum(value2) {
      return reduce(reduce_default.reduceAdd(value2), reduce_default.reduceSubtract(value2), zero_default);
    }
    function value() {
      if (resetNeeded) reset(), resetNeeded = false;
      return reduceValue;
    }
    function dispose() {
      var i = filterListeners.indexOf(update);
      if (i >= 0) filterListeners.splice(i, 1);
      i = dataListeners.indexOf(add2);
      if (i >= 0) dataListeners.splice(i, 1);
      return group;
    }
    return reduceCount();
  }
  function size() {
    return n;
  }
  function all() {
    return data;
  }
  function allFiltered(ignore_dimensions) {
    var array2 = [], i = 0, mask = maskForDimensions(ignore_dimensions || []);
    for (i = 0; i < n; i++) {
      if (filters.zeroExceptMask(i, mask)) {
        array2.push(data[i]);
      }
    }
    return array2;
  }
  function onChange(cb) {
    if (typeof cb !== "function") {
      console.warn("onChange callback parameter must be a function!");
      return;
    }
    callbacks.push(cb);
    return function() {
      callbacks.splice(callbacks.indexOf(cb), 1);
    };
  }
  function triggerOnChange(eventName) {
    for (var i = 0; i < callbacks.length; i++) {
      callbacks[i](eventName);
    }
  }
  return arguments.length ? add(arguments[0]) : crossfilter2;
}
function cr_index(n, m) {
  return (m < 257 ? array_default2.array8 : m < 65537 ? array_default2.array16 : array_default2.array32)(n);
}
function cr_range(n) {
  var range2 = cr_index(n, n);
  for (var i = -1; ++i < n; ) range2[i] = i;
  return range2;
}
function capacity(w) {
  return w === 8 ? 256 : w === 16 ? 65536 : 4294967296;
}

// src/alloylens/js/vis.js
var import_regl = __toESM(require_regl(), 1);
var pyplot_cycles = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf"
];
var C = pyplot_cycles;
function zip(a, b) {
  return a.map((ai, i) => [ai, b[i]]);
}
function linspace(a, b, n) {
  return range(n).map((i) => i / (n - 1) * (b - a) + a);
}
function kde(sel, data, {
  x: x2 = (d) => d,
  normalize: normalize2 = false,
  bandwidth = void 0,
  evaluation_points = void 0,
  width = 300,
  height = 300,
  padding_left = 0,
  padding_right = 0,
  padding_top = 0,
  padding_bottom = 0,
  stroke = "#1f77b4",
  stroke_width = 1,
  is_framed = true,
  histtype = "bar",
  // 'bar' or 'step',
  xticks = void 0,
  yticks = void 0,
  scales = {},
  title = "",
  frame_kwargs = "#eef",
  label_fontsize = 12
} = {}) {
  let kde_values = data.map((seq) => seq.map((d) => x2(d)));
  if (evaluation_points === void 0) {
    let extent2 = extent(kde_values.flat());
    let r = 0;
    evaluation_points = linspace(extent2[0] - 0.1 * r, extent2[1] + 0.1 * r, 100);
  }
  let lines_data = [];
  for (let values of kde_values) {
    lines_data.push(
      compute_kde(values, { evaluation_points, bandwidth, normalize: normalize2 })
    );
  }
  return lines(sel, lines_data, {
    is_framed,
    width,
    height,
    stroke,
    stroke_width,
    // data accessors:
    x: (d) => d[0],
    y: (d) => d[1],
    xticks,
    yticks,
    title,
    padding_left,
    padding_bottom,
    padding_right,
    padding_top,
    label_fontsize
  });
}
function compute_kde(data, {
  evaluation_points = void 0,
  bandwidth = void 0,
  kernel = gaussian_kernel,
  normalize: normalize2 = true
} = {}) {
  if (bandwidth === void 0) {
    let extent2 = extent(data);
    let range2 = extent2[1] - extent2[0];
    bandwidth = Math.pow(data.length, -0.2);
    bandwidth *= range2 / 5;
  }
  if (evaluation_points === void 0) {
    evaluation_points = linspace(...extent(data), 100);
  }
  if (normalize2) {
    return evaluation_points.map((x2) => [
      x2,
      mean(data, (d) => kernel(d - x2, bandwidth))
    ]);
  } else {
    return evaluation_points.map((x2) => [
      x2,
      sum(data, (d) => kernel(d - x2, bandwidth))
    ]);
  }
}
function gaussian_kernel(x2, bandwidth = 1) {
  let h3 = bandwidth;
  let z = h3 * Math.sqrt(2 * Math.PI);
  return 1 / z * Math.exp(-x2 * x2 / (2 * h3 * h3));
}
function lines(container = void 0, data = [
  // array of polylines, where each polyline containes array of nodes. e.g.,
  range(10).map((i) => ({ x: i, y: Math.random() * 2 - 0.5 })),
  [
    { x: 3, y: 0.5 },
    { x: 4, y: -0.5 },
    { x: 5, y: 0 },
    { x: 6, y: 0 }
  ]
], {
  // plotting styles
  is_framed = true,
  width = 400,
  height = 200,
  stroke = (line_data, i) => C[i],
  stroke_width = 4,
  // data accessors:
  x: x2 = (d) => d.x,
  y: y2 = (d) => d.y,
  //scales
  scales = { sx: void 0, sy: void 0 },
  xticks,
  yticks,
  padding_left = 50,
  padding_right = 0,
  padding_top = 0,
  padding_bottom = 12,
  label_fontsize = 2
} = {}) {
  if (container === void 0) {
    container = create_svg(width, height);
  }
  if (is_framed) {
    let frame1 = container.call(frame2, data.flat(), {
      is_square_scale: false,
      scales,
      width,
      height,
      x: x2,
      y: y2,
      xticks,
      yticks,
      padding_left,
      padding_right,
      padding_top,
      padding_bottom,
      label_fontsize
    });
    scales.sx = frame1.scales.sx;
    scales.sy = frame1.scales.sy;
  } else {
    if (scales.sx === void 0) {
      scales.sx = create_scale(data.flat(), {
        value_accessor: (d) => x2(d),
        range: [0, width]
      });
    }
    if (scales.sy === void 0) {
      scales.sy = create_scale(data.flat(), {
        value_accessor: (d) => y2(d),
        range: [height, 0]
      });
    }
  }
  container.selectAll(".line").data(data).join("path").attr("class", "line").attr("fill", "none").attr("stroke", stroke).attr("stroke-width", stroke_width).attr("stroke-linecap", "round").attr(
    "d",
    line_default().x(function(d) {
      return scales.sx(x2(d));
    }).y(function(d) {
      return scales.sy(y2(d));
    })
  );
  return container;
}
function create_scatter_gl_program(regl) {
  let vert = `
    precision mediump float;
    attribute vec2 position;
    attribute vec4 color;
    attribute float size;
    attribute float depth;
    attribute float stroke_width;
    varying float v_size;
    varying vec4 v_color;
    varying float v_stroke_width;

    void main() {
      gl_Position = vec4(position, depth, 1.0);
      gl_PointSize = size;
      v_color = color;
      v_size = size;
      v_stroke_width = stroke_width;
    }`;
  let frag = `
    precision mediump float;
    varying vec4 v_color;
    varying float v_size;
    uniform vec3 u_stroke;
    //uniform float u_stroke_width;
    varying float v_stroke_width;

    void main() {
      float eps = 0.01;
      //round marks
      vec2 pointCoord = (gl_PointCoord.xy-0.5)*2.0;
      float dist = length(pointCoord); // distance to point center, normalized to [0,1]
      if (dist>1.0)
        discard;
      gl_FragColor = v_color;
      gl_FragColor.a = 1.0;
      if(v_stroke_width > 0.01){
        float stroke = v_stroke_width / v_size; //normalized stroke width
        float mix_factor = smoothstep(1.0-stroke-eps, 1.0-stroke+eps, dist);
        gl_FragColor = mix( v_color, vec4(u_stroke, 1.0), mix_factor);
        float alpha = 1.0 - smoothstep(1.0-stroke+stroke*0.8, 1.0, dist);
        gl_FragColor.a = alpha;
      }
      // debug depth:
      // gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
    }`;
  let render_func = regl({
    attributes: {
      position: regl.prop("positions"),
      color: regl.prop("colors"),
      size: regl.prop("size"),
      depth: regl.prop("depth"),
      stroke_width: regl.prop("stroke_width")
    },
    uniforms: {
      u_stroke: regl.prop("stroke")
    },
    count: regl.prop("count"),
    primitive: "points",
    vert,
    frag,
    depth: {
      enable: true,
      mask: true,
      func: "<",
      range: [0, 1]
    },
    //alpha blend
    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1
      },
      equation: {
        rgb: "add",
        alpha: "add"
      },
      color: [0, 0, 0, 0]
    }
  });
  return render_func;
}
function scatter_frame(container = void 0, data = void 0, {
  background = "#eee",
  xticks = 5,
  yticks = 5,
  x_tickvalues = void 0,
  y_tickvalues = void 0,
  x: x2 = (d) => d.x,
  y: y2 = (d) => d.y,
  scales = {},
  width = 500,
  height = 500,
  padding_bottom = 18,
  padding_left = 40,
  padding_right = 0,
  padding_top = 0,
  pad = 0.1,
  title = void 0,
  is_square_scale = false,
  is_log_scale = false,
  xlabel = void 0,
  ylabel = void 0,
  label_fontsize = 10
} = {}) {
  if (container === void 0) {
    container = create_svg(width, height);
  }
  container.call(frame2, data, {
    background,
    xticks,
    yticks,
    x_tickvalues,
    y_tickvalues,
    x: x2,
    y: y2,
    scales,
    width,
    height,
    padding_bottom,
    padding_left,
    padding_right,
    padding_top,
    pad,
    title,
    is_square_scale,
    is_log_scale,
    xlabel,
    ylabel,
    label_fontsize
  });
  let return_node = container.node();
  return_node.scales = container.scales;
  return_node.ax = container.ax;
  return_node.ay = container.ay;
  return_node.xticks = xticks;
  return_node.yticks = yticks;
  return return_node;
}
function color2gl(color2) {
  let c;
  if (typeof color2 === "string") {
    c = rgb(color(color2));
  } else if (typeof color2 === "object") {
    if (color2.length !== void 0) {
      c = rgb(...color2);
    } else {
      c = color2;
    }
  }
  if (!c) {
    const dc = color(fallback);
    c = rgb(dc || "#7f7f7f");
  }
  return [c.r / 255, c.g / 255, c.b / 255];
}
function clip(value, vmin, vmax) {
  return Math.min(Math.max(vmin, value), vmax);
}
function create_canvas(width, height, dpi_scale = 1) {
  let canvas = document.createElement("canvas");
  canvas.width = width * window.devicePixelRatio * dpi_scale;
  canvas.height = height * window.devicePixelRatio * dpi_scale;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  return canvas;
}
function splom_gl2(container_div = void 0, data = void 0, {
  width = 1e3,
  height = 800,
  attrs = ["column_a", "column_b", "column_c"],
  row_attrs = void 0,
  col_attrs = void 0,
  depth = void 0,
  layout = "upper",
  padding_left = 16,
  padding_right = 0,
  padding_top = 0,
  padding_bottom = 20,
  subplot_padding_left = 16,
  subplot_padding_right = 0,
  subplot_padding_top = 0,
  subplot_padding_bottom = 20,
  //x and y axes
  scales = { sc: (d) => C[0] },
  is_square_scale = false,
  xticks = 5,
  yticks = 5,
  show_tick_texts = true,
  show_axis_label = true,
  //color styles,
  s = () => 5,
  //mark size,
  stroke = "#eee",
  stroke_width = 1,
  dpi_scale = 1,
  kde_filters = [(d) => true],
  label_fontsize = 10,
  brush: brush2 = true,
  brush_highlight = false,
  brush_listeners = {
    start: () => {
    },
    brush: (brushed_data) => {
      console.log("brushed_data", brushed_data);
    },
    end: () => {
    }
  }
} = {}) {
  row_attrs = row_attrs || attrs;
  col_attrs = col_attrs || attrs;
  let n_row_attrs = row_attrs.length;
  let n_col_attrs = col_attrs.length;
  let plot_width, plot_height;
  plot_width = (width - padding_left - padding_right) / n_col_attrs;
  plot_height = (height - padding_top - padding_bottom) / n_row_attrs;
  if (depth === void 0) {
    depth = (d, i) => -i / data.length;
  }
  if (container_div === void 0) {
    container_div = create_default("div").style("height", `${height}px`);
  }
  let frame_container = container_div.append("div").attr("class", "frame-container").style("position", "relative");
  let canvas = create_canvas(width, height, dpi_scale);
  let regl = (0, import_regl.default)({ canvas });
  select_default2(canvas).style("position", "absolute");
  container_div.node().appendChild(canvas);
  let overlay_container = container_div.append("div").attr("class", "overlay-container").style("position", "relative");
  let _render = create_scatter_gl_program(regl);
  let cross = null;
  let dimensions = {};
  let subplot_brushes = range(n_row_attrs).map((_) => []);
  let active_brushes = /* @__PURE__ */ new Set();
  if (brush2) {
    cross = src_default(data);
    for (let attr of new Set(row_attrs.concat(col_attrs))) {
      dimensions[attr] = cross.dimension((d) => d[attr]);
    }
    cross.dimensions = dimensions;
  }
  function draw_subplots() {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
      stencil: 0
    });
    let subplots = range(n_row_attrs).map((_) => []);
    for (let i = 0; i < n_row_attrs; i++) {
      for (let j = 0; j < n_col_attrs; j++) {
        if (layout === "lower" && i > j || layout === "upper" && i < j) {
          continue;
        }
        if (row_attrs[i] === col_attrs[j]) {
          let kde_plot = kde(
            void 0,
            kde_filters.map((f) => data.filter(f)),
            {
              x: (d) => d[col_attrs[j]],
              height: plot_height,
              width: plot_width,
              padding_top: subplot_padding_top,
              padding_bottom: subplot_padding_bottom,
              padding_left: subplot_padding_left,
              padding_right: subplot_padding_right,
              stroke: (seq, i2) => C[i2],
              stroke_width: 1,
              yticks: 2,
              xticks,
              label_fontsize,
              title: "",
              xlabel: col_attrs[j],
              ylabel: "Density"
            }
          );
          kde_plot.style("overflow", "visible");
          kde_plot.select(".y-axis").selectAll("text").remove();
          subplots[i][j] = kde_plot;
          let left2 = padding_left + j * plot_width;
          let top2 = padding_top + (n_row_attrs - 1 - i) * plot_height;
          kde_plot.attr("class", "kde").style("position", "absolute").style("overflow", "visible").style("left", `${left2}px`).style("top", `${top2}px`);
          if (brush2) {
            let overlay_ii = create_svg(plot_width, plot_height).attr("class", "overlay").style("position", "absolute").style("left", `${padding_left + j * plot_width}px`).style(
              "top",
              `${padding_top + (n_row_attrs - 1 - i) * plot_height}px`
            );
            overlay_container.node().appendChild(overlay_ii.node());
            let extent2 = [
              [subplot_padding_left, subplot_padding_top],
              [
                plot_width - subplot_padding_right,
                plot_height - subplot_padding_bottom
              ]
            ];
            let dim_x = dimensions[col_attrs[j]];
            brush2 = brushX().extent(extent2).on("start", () => {
            }).on("brush", ({ selection: selection2 }) => {
              let { sx, sy } = kde_plot.scales;
              let [bx0, bx1] = selection2;
              let [x0, x1] = [sx.invert(bx0), sx.invert(bx1)];
              dim_x.filter([x0, x1]);
              let brushed_data = dim_x.bottom(Infinity);
              highlight_brushed(
                data,
                scales.sc,
                cross,
                subplots,
                row_attrs,
                col_attrs
              );
              return_node.brushed_data = brushed_data;
              if (brush_listeners["brush"]) {
                brush_listeners["brush"](return_node.brushed_data);
              }
            }).on("end", (e) => {
              if (e.selection === null) {
                dim_x.filterAll();
                let brushed_data = dim_x.bottom(Infinity);
                data.forEach((d, i2) => {
                  d.brushed = cross.isElementFiltered(i2);
                });
                highlight_brushed(
                  data,
                  scales.sc,
                  cross,
                  subplots,
                  row_attrs,
                  col_attrs
                );
                return_node.brushed_data = brushed_data;
                if (brush_listeners["end"]) {
                  brush_listeners["end"]([]);
                }
              } else {
                if (brush_listeners["end"]) {
                  brush_listeners["end"](return_node.brushed_data);
                }
              }
            });
            overlay_ii.append("g").attr("class", "brush").call(brush2);
          }
          frame_container.node().appendChild(kde_plot.node());
        } else {
          let plot = { plot_width, plot_height, scales, brush: brush2 };
          subplots[i][j] = plot;
          let frame3 = scatter_frame(void 0, data, {
            x: (d) => d[col_attrs[j]],
            y: (d) => d[row_attrs[i]],
            width: plot_width,
            height: plot_height,
            xlabel: i == 0 ? col_attrs[j] : "",
            ylabel: j == 0 ? row_attrs[i] : "",
            is_square_scale,
            xticks,
            yticks,
            padding_top: subplot_padding_top,
            padding_bottom: subplot_padding_bottom,
            padding_left: subplot_padding_left,
            padding_right: subplot_padding_right,
            title: "",
            label_fontsize
          });
          frame_container.node().appendChild(frame3);
          let left2 = padding_left + j * plot_width;
          let top2 = padding_top + (n_row_attrs - 1 - i) * plot_height;
          select_default2(frame3).attr("class", "frame").style("position", "absolute").style("overflow", "visible").style("left", `${left2}px`).style("top", `${top2}px`);
          select_default2(frame3).selectAll("text").style("font-size", `${label_fontsize}px`);
          if (!show_axis_label) {
            select_default2(frame3).selectAll("text.xlabel").remove();
            select_default2(frame3).selectAll("text.ylabel").remove();
          }
          if (!show_tick_texts) {
            select_default2(frame3).selectAll(".x-axis .tick text").style("display", "none");
            select_default2(frame3).selectAll(".y-axis .tick text").style("display", "none");
          }
          select_default2(frame3).selectAll(".y-axis .tick text").attr("transform", "translate(-10,0)");
          let { sx, sy } = frame3.scales;
          let pixel2clip_x = linear2().domain([0, width]).range([-1, 1]);
          let pixel2clip_y = linear2().domain([0, height]).range([1, -1]);
          let sx_gl = linear2().domain(sx.domain()).range([
            pixel2clip_x(sx.range()[0] + left2),
            pixel2clip_x(sx.range()[1] + left2)
          ]);
          let sy_gl = linear2().domain(sy.domain()).range([
            pixel2clip_y(sy.range()[0] + top2),
            pixel2clip_y(sy.range()[1] + top2)
          ]);
          let sc = scales.sc || ((d) => C[0]);
          let sc_gl = (d) => {
            let c = sc(d);
            return [...color2gl(c), 1];
          };
          let overlay_ij = create_svg(plot_width, plot_height).attr("class", "overlay").style("position", "absolute").style("left", `${padding_left + j * plot_width}px`).style(
            "top",
            `${padding_top + (n_row_attrs - 1 - i) * plot_height}px`
          );
          overlay_container.node().appendChild(overlay_ij.node());
          if (brush2) {
            let brush_record_format = function(row_attr, col_attr) {
              return `${col_attr}-vs-${row_attr}`;
            };
            let extent2 = [
              [subplot_padding_left, subplot_padding_top],
              [
                plot_width - subplot_padding_right,
                plot_height - subplot_padding_bottom
              ]
            ];
            let dim_x = dimensions[col_attrs[j]];
            let dim_y = dimensions[row_attrs[i]];
            brush2 = brush_default().extent(extent2).on("start", ({ selection: selection2, sourceEvent }) => {
              if (!sourceEvent) return;
              if (brush_listeners["start"]) {
                brush_listeners["start"](return_node.brushed_data);
              }
            }).on("brush", ({ selection: selection2, sourceEvent }) => {
              if (!sourceEvent) return;
              let [bx0, bx1] = [selection2[0][0], selection2[1][0]];
              let [by0, by1] = [selection2[0][1], selection2[1][1]];
              let [x0, x1] = [sx.invert(bx0), sx.invert(bx1)];
              let [y0, y1] = [sy.invert(by0), sy.invert(by1)];
              [y0, y1] = [Math.min(y0, y1), Math.max(y0, y1)];
              dim_x.filter([x0, x1]);
              dim_y.filter([y0, y1]);
              let brushed_data = dim_x.bottom(Infinity);
              active_brushes.add(
                brush_record_format(row_attrs[i], col_attrs[j])
              );
              highlight_brushed(
                data,
                scales.sc,
                cross,
                subplots,
                row_attrs,
                col_attrs
              );
              for (let j2 = 0; j2 < n_col_attrs; j2++) {
                let b = brush_record_format(row_attrs[i], col_attrs[j2]);
                if (j !== j2 && active_brushes.has(b)) {
                  let [[cx0, cy0], [cx1, cy1]] = brushSelection(
                    subplots[i][j2].g_brush.node()
                  );
                  subplots[i][j2].g_brush.call(subplots[i][j2].brush.move, [
                    [cx0, by0],
                    [cx1, by1]
                  ]);
                }
              }
              for (let i2 = 0; i2 < n_row_attrs; i2++) {
                let b = brush_record_format(row_attrs[i2], col_attrs[j]);
                if (i !== i2 && active_brushes.has(b)) {
                  let [[cx0, cy0], [cx1, cy1]] = brushSelection(
                    subplots[i2][j].g_brush.node()
                  );
                  subplots[i2][j].g_brush.call(subplots[i2][j].brush.move, [
                    [bx0, cy0],
                    [bx1, cy1]
                  ]);
                }
              }
              return_node.brushed_data = brushed_data;
              if (brush_listeners["end"]) {
                brush_listeners["end"]([]);
              }
            }).on("end", ({ selection: selection2, sourceEvent }) => {
              if (!sourceEvent) return;
              if (selection2 === null) {
                dim_x.filterAll();
                dim_y.filterAll();
                active_brushes.delete(
                  brush_record_format(row_attrs[i], col_attrs[j])
                );
                let brushed_data = dim_x.bottom(Infinity);
                data.forEach((d, i2) => {
                  d.brushed = cross.isElementFiltered(i2);
                });
                highlight_brushed(
                  data,
                  scales.sc,
                  cross,
                  subplots,
                  row_attrs,
                  col_attrs
                );
                return_node.brushed_data = brushed_data;
                if (brush_listeners["end"]) {
                  brush_listeners["end"]([]);
                }
              } else {
                if (brush_listeners["end"]) {
                  brush_listeners["end"](return_node.brushed_data);
                }
              }
            });
            let g_brush = overlay_ij.append("g").attr("class", "brush").call(brush2);
            plot.brush = brush2;
            plot.g_brush = g_brush;
          }
          plot.data = data;
          plot.x = (d) => d[col_attrs[j]];
          plot.y = (d) => d[row_attrs[i]];
          plot.frame = frame3;
          plot.overlay = overlay_ij;
          plot.scales = {
            sx: frame3.scales.sx,
            sy: frame3.scales.sy,
            sc: scales.sc,
            sx_gl,
            sy_gl,
            sc_gl
          };
          plot.positions = data.map((d) => [
            sx_gl(d[col_attrs[j]]),
            sy_gl(d[row_attrs[i]])
          ]);
          plot.size = data.map(
            (d, i2) => s(d, i2) * window.devicePixelRatio * dpi_scale
          );
          plot.render = (data2, {} = {}) => {
            _render({
              positions: plot.positions,
              colors: data2.map((d) => sc_gl(d)),
              count: data2.length,
              size: plot.size,
              stroke: color2gl(stroke),
              stroke_width: data2.map(
                (_) => stroke_width * window.devicePixelRatio
              ),
              depth: data2.map((d, i2) => depth(d, i2))
            });
          };
          plot.recolor_data = (colors, { depths = void 0, stroke_widths = void 0 } = {}) => {
            let recolor_data = {
              positions: plot.positions,
              size: plot.size,
              colors,
              count: data.length,
              stroke: color2gl(stroke),
              stroke_width: stroke_widths !== void 0 ? stroke_widths.map((d) => d * window.devicePixelRatio) : data.map((_) => stroke_width * window.devicePixelRatio),
              depth: depths || data.map((d, i2) => depth(d, i2))
            };
            return recolor_data;
          };
          plot.recolor = (colors, { depths = void 0, stroke_widths = void 0 } = {}) => {
            _render(plot.recolor_data(colors, { depths, stroke_widths }));
          };
          plot.render(data);
        }
      }
    }
    return subplots;
  }
  let return_node = container_div.node();
  return_node.data = data;
  return_node.subplots = draw_subplots();
  return_node.cross = cross;
  return_node.dimensions = dimensions;
  return_node.row_attrs = row_attrs;
  return_node.col_attrs = col_attrs;
  return_node.clear = () => {
    regl.clear({
      color: [0, 0, 0, 0],
      depth: 1,
      stencil: 0
    });
  };
  return_node.highlight_brushed = highlight_brushed;
  return_node.highlight_brushed_2 = highlight_brushed_2;
  return_node.recolor = (colors, { depths } = {}) => {
    return_node.clear();
    if (return_node.combined_data === void 0) {
      return_node.combined_data = {
        positions: [],
        colors: [],
        count: 0,
        size: [],
        depth: [],
        stroke_width: void 0,
        stroke: void 0
      };
      return_node.subplots.forEach((row, i) => {
        row.forEach((subplot, j) => {
          if (subplot !== void 0 && i != j) {
            let d = subplot.recolor_data(colors, { depths });
            for (let attr of ["positions", "colors", "depth", "size"]) {
              return_node.combined_data[attr] = return_node.combined_data[attr].concat(d[attr]);
            }
            return_node.combined_data.count += d.count;
            return_node.combined_data.stroke = d.stroke;
            return_node.combined_data.stroke_width = d.stroke_width;
          }
        });
      });
    } else {
      return_node.combined_data.colors = [];
      return_node.combined_data.depth = [];
      return_node.subplots.forEach((row, i) => {
        row.forEach((subplot, j) => {
          if (subplot !== void 0 && i != j) {
            return_node.combined_data.colors = return_node.combined_data.colors.concat(colors);
            return_node.combined_data.depth = return_node.combined_data.depth.concat(depths);
          }
        });
      });
    }
    _render(return_node.combined_data);
  };
  return_node.redraw_kde = (kde_filters2, kde_strokes) => {
    frame_container.selectAll(".kde").remove();
    for (let i = 0; i < n_row_attrs; i++) {
      let j = i;
      let kde_data = kde_filters2.map((f) => data.filter(f));
      let kde_plot = kde(void 0, kde_data, {
        x: (d) => d[col_attrs[i]],
        height: plot_height,
        width: plot_width,
        padding_top,
        padding_bottom,
        padding_left,
        padding_right,
        stroke: (seq, i2) => kde_strokes[i2],
        //TODO
        stroke_width: 1,
        yticks: 2,
        xticks,
        label_fontsize
      });
      kde_plot.style("overflow", "visible");
      kde_plot.select(".y-axis").selectAll("text").remove();
      let left2 = padding_left + j * plot_width;
      let top2 = padding_top + (n_row_attrs - 1 - i) * plot_height;
      kde_plot.attr("class", "kde").style("position", "absolute").style("overflow", "visible").style("left", `${left2}px`).style("top", `${top2}px`);
      frame_container.node().appendChild(kde_plot.node());
    }
  };
  return return_node;
}
function point_on_cuboid(d, attrs, dimensions) {
  let p = attrs.map((attr) => {
    let bound = dimensions[attr].currentFilter();
    if (bound !== void 0) {
      return clip(d[attr], bound[0], bound[1]);
    } else {
      return d[attr];
    }
  });
  p = Object.fromEntries(zip(attrs, p));
  return p;
}
function distance_to_cuboid(d, attrs, dimensions, attr_extents) {
  let poc = point_on_cuboid(d, attrs, dimensions);
  let dist = sum(
    attrs.map((attr) => {
      let [vmin, vmax] = attr_extents[attr];
      let p0_xi = (d[attr] - vmin) / (vmax - vmin + 1e-4);
      let p1_xi = (poc[attr] - vmin) / (vmax - vmin + 1e-4);
      return Math.pow(p0_xi - p1_xi, 2);
    })
  );
  return dist;
}
function highlight_brushed_2(data, sc, cross, subplots, row_attrs, col_attrs) {
  let filter_nonempty = cross.allFiltered().length > 0;
  if (filter_nonempty) {
    highlight_brushed(data, sc, cross, subplots, row_attrs, col_attrs);
  } else {
    let all_attrs = row_attrs.concat(col_attrs);
    let attr_extents = Object.fromEntries(
      zip(
        all_attrs,
        all_attrs.map((a) => extent(data, (d) => d[a]))
      )
    );
    data.forEach((d, i) => {
      d.dist = distance_to_cuboid(d, all_attrs, cross.dimensions, attr_extents);
    });
    let [vmin, vmax] = extent(data, (d) => d.dist);
    let color_reach = 0.02;
    let [cmin, cmax] = [vmin, vmin + color_reach * (vmax - vmin)];
    data.forEach((d, i) => {
      d.brushed = d.dist < cmax;
    });
    sc = linear2().domain([cmin, cmax]).range([C[1], "#aaa"]).interpolate(hcl_default).clamp(true);
    let sc_gl = (d) => {
      let c = sc(d.dist);
      return [...color2gl(c), 1];
    };
    let colors = data.map((d) => sc_gl(d));
    let depths = data.map((d, i) => (d.dist - vmin) / (vmax - vmin + 1e-4));
    let stroke_widths = data.map(
      (d, i) => d.dist > vmin + color_reach * (vmax - vmin) ? 0 : 1
    );
    subplots.forEach(
      (subplot_row, i) => subplot_row.forEach((subplot, j) => {
        if (row_attrs[i] !== col_attrs[j]) {
          subplot.recolor(colors, { depths, stroke_widths });
        }
      })
    );
  }
}
function highlight_brushed(data, sc, cross, subplots, row_attrs, col_attrs, brush_highlight = true) {
  data.forEach((d, i) => {
    d.brushed = cross.isElementFiltered(i);
  });
  const colors = data.map((d, i) => {
    const c = d.brushed ? sc(d, i) : "#aaa";
    return [...color2gl(c), 1];
  });
  const depths = data.map((d, i) => d.brushed ? -i / data.length : 0);
  const stroke_widths = data.map((d) => d.brushed ? 1 : 0);
  if (brush_highlight) {
    subplots.forEach(
      (subplot_row, i) => subplot_row.forEach((subplot, j) => {
        if (row_attrs[i] !== col_attrs[j]) {
          subplot.recolor(colors, { depths, stroke_widths });
        }
      })
    );
  }
}
function create_svg(width = 400, height = 300, bg = void 0) {
  let svg = create_default("svg").attr("width", width).attr("height", height);
  if (bg) {
    svg.style("background", bg);
  }
  return svg;
}
function frame2(sel = void 0, data = void 0, {
  x_label_offset = 24,
  y_label_offset = -10,
  background = "#eee",
  xticks = 4,
  yticks = 4,
  x_tickvalues = void 0,
  y_tickvalues = void 0,
  x: x2 = (d) => d.x,
  y: y2 = (d) => d.y,
  scales = {},
  width = 200,
  height = 200,
  padding_bottom = 18,
  padding_left = 40,
  padding_right = 0,
  padding_top = 0,
  pad = 0.1,
  s = (d) => 10,
  //marker size
  return_obj = "g",
  title = void 0,
  font_family = "sans-serif",
  font_size = 14,
  is_square_scale = true,
  is_log_scale = false,
  xlabel = void 0,
  ylabel = void 0,
  label_fontsize = 10,
  stroke = "#fff",
  stroke_width = 0.2
} = {}) {
  if (sel === void 0) {
    sel = create_svg(width, height);
  }
  let ex = data !== void 0 ? extent(data, (d) => x2(d)) : [0, 1];
  let ey = data !== void 0 ? extent(data, (d) => y2(d)) : [0, 1];
  if (x_tickvalues !== void 0) {
    ex[0] = Math.min(ex[0], min(x_tickvalues));
    ex[1] = Math.max(ex[1], max(x_tickvalues));
  }
  if (y_tickvalues !== void 0) {
    ey[0] = Math.min(ey[0], min(y_tickvalues));
    ey[1] = Math.max(ey[1], max(y_tickvalues));
  }
  ex = [ex[0] - (ex[1] - ex[0]) * pad, ex[1] + (ex[1] - ex[0]) * pad];
  ey = [ey[0] - (ey[1] - ey[0]) * pad, ey[1] + (ey[1] - ey[0]) * pad];
  let rx = [padding_left, width - padding_right];
  let ry = [height - padding_bottom, padding_top];
  let sx, sy;
  if (is_square_scale) {
    let [sx0, sy0] = square_scale(ex, ey, rx, ry);
    sx = scales.sx || sx0;
    sy = scales.sy || sy0;
  } else {
    sx = is_log_scale ? log() : linear2();
    sy = is_log_scale ? log() : linear2();
    sx = scales.sx || sx.domain(ex).range(rx);
    sy = scales.sy || sy.domain(ey).range(ry);
  }
  let main = sel.append("g").attr("class", "frame");
  main.selectAll(".bg-rect").data([0]).join("rect").attr("class", "bg-rect").attr("x", padding_left).attr("y", padding_top).attr("width", width - padding_left - padding_right).attr("height", height - padding_top - padding_bottom).attr("fill", background);
  let g_axes = main.append("g").attr("class", "axes");
  let g_labels = main.append("g").attr("class", "labels");
  let ax = axisBottom(sx).ticks(xticks).tickSizeInner(-(height - padding_bottom - padding_top));
  if (x_tickvalues !== void 0) {
    ax.tickValues(x_tickvalues);
  }
  let gx = g_axes.append("g").attr("class", "x-axis").attr("transform", `translate(0,${height - padding_bottom})`).call(ax);
  gx.selectAll("text").style("font-size", `${label_fontsize}px`);
  let ay = axisLeft(sy).ticks(yticks).tickSizeInner(-(width - padding_left - padding_right));
  if (y_tickvalues !== void 0) {
    ay.tickValues(y_tickvalues);
  }
  let gy = g_axes.append("g").attr("class", "y-axis").attr("transform", `translate(${padding_left},0)`).call(ay);
  gy.selectAll("text").style("font-size", `${label_fontsize}px`);
  sel.selectAll(".tick > line").style("stroke", stroke || color(background).brighter());
  sel.selectAll("path.domain").style("display", "none");
  if (title) {
    g_labels.selectAll(".title").data([title]).join("text").attr("class", "title").attr(
      "transform",
      `translate(${padding_left + (width - padding_right - padding_left) / 2},${padding_top - 2})`
    ).attr("alignment-baseline", "top").attr("text-anchor", "middle").style("font-size", `${font_size}px`).style("font-family", font_family).text((d) => d);
  }
  if (xlabel !== void 0) {
    g_labels.selectAll(".xlabel").data([xlabel]).join("text").attr("class", "xlabel").attr(
      "transform",
      `translate(${mean(sx.range())},${height - padding_bottom - 2 + x_label_offset})`
    ).attr("text-anchor", "middle").attr("fill", "#666").style("font-size", `${label_fontsize}px`).text((d) => d);
  }
  if (ylabel !== void 0) {
    g_labels.selectAll(".ylabel").data([ylabel]).join("text").attr("class", "ylabel").attr(
      "transform",
      `translate(${padding_left + 2 + y_label_offset},${mean(
        sy.range()
      )}) rotate(90)`
    ).attr("alignment-baseline", "bottom").attr("text-anchor", "middle").attr("fill", "#666").style("font-size", `${label_fontsize}px`).text((d) => d);
  }
  let res = sel;
  res.scales = { sx, sy };
  res.x = x2;
  res.y = y2;
  res.ax = ax;
  res.ay = ay;
  res.gx = gx;
  res.gy = gy;
  res.styles = {
    plot_width: width,
    plot_height: height,
    padding_left,
    padding_right,
    padding_top,
    padding_bottom
  };
  return res;
}
function square_scale(x_extent, y_extent, width_extent, height_extent) {
  let cx = (x_extent[0] + x_extent[1]) / 2;
  let cy = (y_extent[0] + y_extent[1]) / 2;
  let cw = (width_extent[0] + width_extent[1]) / 2;
  let ch = (height_extent[0] + height_extent[1]) / 2;
  let rx = (x_extent[1] - x_extent[0]) / 2;
  let ry = (y_extent[1] - y_extent[0]) / 2;
  let rw = (width_extent[1] - width_extent[0]) / 2;
  let rh = (height_extent[1] - height_extent[0]) / 2;
  let sx, sy;
  if (Math.abs(rw / rh) > rx / ry) {
    sy = linear2().domain([cy - ry, cy + ry]).range([ch - rh, ch + rh]);
    sx = linear2().domain([cx - ry, cx + ry]).range([
      cw - Math.abs(rh) * Math.sign(rw),
      cw + Math.abs(rh) * Math.sign(rw)
    ]);
  } else {
    sx = linear2().domain([cx - rx, cx + rx]).range([cw - rw, cw + rw]);
    sy = linear2().domain([cy - rx, cy + rx]).range([
      ch - Math.abs(rw) * Math.sign(rh),
      ch + Math.abs(rw) * Math.sign(rh)
    ]);
  }
  return [sx, sy];
}
function cumulative_sum(arr) {
  const cumulativeArr = [];
  let currentSum = 0;
  for (let i = 0; i < arr.length; i++) {
    currentSum += arr[i];
    cumulativeArr.push(currentSum);
  }
  return cumulativeArr;
}

// src/alloylens/js/mywidget.js
function style_control(sel, control_size) {
  sel.attr("fill", C[0]).attr("stroke", "white").attr("stroke-width", control_size / 10).attr("r", control_size / 2);
}
function sanitizeRows(payload, rowAttrs, colAttrs) {
  const need = /* @__PURE__ */ new Set([...rowAttrs || [], ...colAttrs || []]);
  const records = payload && payload.records || [];
  if (need.size === 0) return records;
  const out = [];
  for (const r of records) {
    let ok = true;
    const clone = { ...r };
    for (const k of need) {
      const v = +clone[k];
      if (!Number.isFinite(v)) {
        ok = false;
        break;
      }
      clone[k] = v;
    }
    if (ok) out.push(clone);
  }
  return out;
}
function render({ model, el }) {
  const payload = model.get("data") || {};
  const col_attrs = model.get("col_attrs") || [];
  const row_attrs = model.get("row_attrs") || [];
  const subplot_width = model.get("subplot_width") ?? 200;
  const subplot_height = model.get("subplot_height") ?? 200;
  el.innerHTML = "";
  if (!payload.records || row_attrs.length === 0 || col_attrs.length === 0) {
    const msg = document.createElement("div");
    msg.style.cssText = "font:12px system-ui;color:#666";
    msg.textContent = "alloylens: waiting for data, row_attrs and col_attrs\u2026";
    el.appendChild(msg);
    return;
  }
  const data = sanitizeRows(payload, row_attrs, col_attrs);
  const side_bar_width = 90;
  const bottom_bar_height = 90;
  const splom_width = col_attrs.length * subplot_width;
  const splom_height = row_attrs.length * subplot_height;
  const ui_width = model.get("width") || Math.min(
    splom_width + side_bar_width,
    el.getBoundingClientRect().width || splom_width + side_bar_width
  );
  const ui_height = model.get("height") || Math.min(
    splom_height + bottom_bar_height,
    Math.max(240, Math.floor(ui_width * 0.618))
  );
  select_default2(el).style("width", `${ui_width}px`).style("height", `${ui_height}px`);
  const root_div = create_default("div").attr("class", "root-div ui-container").style("position", "relative").style("width", `${ui_width}px`).style("height", `${ui_height}px`).style("overflow", "scroll");
  const splom_container = root_div.append("div").attr("class", "splom-container").style("position", "absolute").style("top", `0px`).style("left", `${side_bar_width}px`);
  const splom = splom_gl2(splom_container, data, {
    layout: "both",
    // full matrix (upper + lower)
    histogram: true,
    // keep diagonal density look if your vis.js uses it
    width: splom_width,
    height: splom_height,
    padding_left: 0,
    padding_right: 0,
    padding_bottom: 0,
    padding_top: 0,
    subplot_padding_left: 0,
    subplot_padding_right: 12,
    subplot_padding_top: 6,
    subplot_padding_bottom: 6,
    s: () => 4,
    col_attrs,
    row_attrs,
    brush: true,
    xticks: 3,
    yticks: 3,
    show_tick_texts: false,
    show_axis_label: false
  });
  select_default2(splom_container.node()).selectAll(".overlay .brush").style("display", "none").style("pointer-events", "none");
  const side_sliders = root_div.append("svg").attr("class", "side-slider").attr("width", side_bar_width).attr("height", splom_height).style("position", "sticky").style("left", `0px`).style("z-index", 1).call(draw_side_sliders, splom, model);
  const bottom_sliders = root_div.append("svg").attr("class", "bottom-slider").attr("width", splom_width + side_bar_width).attr("height", bottom_bar_height).style("position", "sticky").style("left", `0px`).style("bottom", `0px`).style("z-index", 2).append("g").attr("transform", `translate(${side_bar_width},0)`).call(draw_bottom_sliders, splom, model);
  model.on("change:curves", function() {
    const new_curves = model.get("curves") || {};
    for (let i = 0; i < row_attrs.length; i++) {
      for (let j = 0; j < col_attrs.length; j++) {
        const line_data = new_curves[col_attrs[j]] && new_curves[col_attrs[j]][row_attrs[i]];
        if (!line_data) continue;
        const sx = splom.subplots[i][j].scales.sx;
        const sy = splom.subplots[i][j].scales.sy;
        splom.subplots[i][j].overlay.call(lines, [line_data], {
          x: (d) => d[0],
          y: (d) => d[1],
          scales: { sx, sy },
          stroke_width: 4,
          stroke: () => C[1],
          is_framed: false
        });
      }
    }
  });
  select_default2(document.body).on("keydown.alloylens", function(event) {
    if (event.key !== "s") return;
    const newFlag = !model.get("surrogate");
    model.set("surrogate", newFlag);
    model.save_changes();
    for (let i = 0; i < row_attrs.length; i++) {
      for (let j = 0; j < col_attrs.length; j++) {
        splom.subplots[i][j].overlay.selectAll(".line").attr("display", newFlag ? "" : "none");
      }
    }
  });
  el.appendChild(root_div.node());
}
function draw_bottom_sliders(svg, splom, model) {
  const subplots = splom.subplots;
  const n_cols = subplots[0].length;
  const control_size = 12;
  const y_offset = 30;
  const x_offsets = cumulative_sum([
    0,
    ...subplots[0].map((sp) => sp.plot_width)
  ]);
  const sxs = subplots[0].map((sp) => sp.scales.sx);
  const fmt = format(".3~g");
  const g = svg.selectAll("g.bottom-slider").data(range(n_cols)).join("g").attr("class", "bottom-slider").attr("transform", (j) => `translate(${x_offsets[j]},0)`);
  const label_min = g.append("text").attr("class", "bottom-range-min").attr("y", y_offset - 20).attr("text-anchor", "middle").style("font", "10px sans-serif").style("pointer-events", "none");
  const label_max = g.append("text").attr("class", "bottom-range-max").attr("y", y_offset - 20).attr("text-anchor", "middle").style("font", "10px sans-serif").style("pointer-events", "none");
  const sliders_bg = g.append("line").attr("class", "slider-bg").attr("stroke", "#aaa").attr("stroke-width", control_size * 0.6).attr("x1", (j) => sxs[j].range()[0]).attr("x2", (j) => sxs[j].range()[1]).attr("y1", y_offset).attr("y2", y_offset);
  const sliders_fg = g.append("line").attr("class", "bottom-slider-fg").attr("stroke", C[0]).attr("stroke-width", control_size * 0.6).attr("x1", (j) => sxs[j].range()[0]).attr("x2", (j) => sxs[j].range()[1]).attr("y1", y_offset).attr("y2", y_offset);
  g.append("g").attr("class", "slider-axis").attr("transform", `translate(0,${y_offset + control_size / 2})`).style("z-index", 2).each(function(j) {
    const ticks2 = subplots[0][j].frame.xticks;
    const ax = axisBottom(sxs[j]).ticks(ticks2).tickSizeInner(-control_size);
    const axis2 = select_default2(this).call(ax);
    axis2.selectAll("path.domain").remove();
    axis2.selectAll("g.tick line").attr("stroke", "#eee");
  });
  g.append("text").attr("x", (j) => mean(sxs[j].range())).attr("y", y_offset - 12).style("text-anchor", "middle").text((j) => splom.col_attrs[j]);
  const ctl_min = g.append("circle").attr("class", "slider-control-min").attr("cx", (j) => sxs[j].range()[0]).attr("cy", y_offset).call(style_control, control_size);
  const ctl_max = g.append("circle").attr("class", "slider-control-max").attr("cx", (j) => sxs[j].range()[1]).attr("cy", y_offset).call(style_control, control_size);
  function set_x_filter_bounds(j, lower2, upper, sx) {
    select_default2(ctl_min.nodes()[j]).attr("cx", sx(lower2));
    select_default2(ctl_max.nodes()[j]).attr("cx", sx(upper));
    select_default2(sliders_fg.nodes()[j]).attr("x1", sx(lower2)).attr("x2", sx(upper));
    label_min.attr("x", (jj, i) => i === j ? sx(lower2) : null).text((jj, i) => i === j ? fmt(lower2) : null);
    label_max.attr("x", (jj, i) => i === j ? sx(upper) : null).text((jj, i) => i === j ? fmt(upper) : null);
    const dim = splom.dimensions[splom.col_attrs[j]];
    dim.filter([lower2, upper]);
    splom.highlight_brushed_2(
      splom.data,
      subplots[0][0].scales.sc,
      splom.cross,
      splom.subplots,
      splom.row_attrs,
      splom.col_attrs
    );
    model.set(
      "selected",
      splom.data.map((d) => d.brushed)
    );
    model.set(
      "dists",
      splom.data.map((d) => d.dist)
    );
    model.save_changes();
  }
  ctl_min.call(
    drag_default().on("drag", function(event) {
      const j = select_default2(this).datum();
      const sx = sxs[j];
      const domain = sx.domain();
      const x2 = sx.invert(event.x);
      const x_upper = sx.invert(+select_default2(ctl_max.nodes()[j]).attr("cx"));
      const x_lower = clip(
        x2,
        domain[0],
        x_upper - (domain[1] - domain[0]) * 0.05
      );
      set_x_filter_bounds(j, x_lower, x_upper, sx);
    })
  );
  ctl_max.call(
    drag_default().on("drag", function(event) {
      const j = select_default2(this).datum();
      const sx = sxs[j];
      const domain = sx.domain();
      const x2 = sx.invert(event.x);
      const x_lower = sx.invert(+select_default2(ctl_min.nodes()[j]).attr("cx"));
      const x_upper = clip(
        x2,
        x_lower + (domain[1] - domain[0]) * 0.05,
        domain[1]
      );
      set_x_filter_bounds(j, x_lower, x_upper, sx);
    })
  );
  let timeout2 = null;
  sliders_fg.on("click", function(event) {
    clearTimeout(timeout2);
    timeout2 = setTimeout(() => {
      const me = select_default2(this);
      const j = me.datum();
      const sx = sxs[j];
      const x1 = sx.invert(+me.attr("x1"));
      const x2 = sx.invert(+me.attr("x2"));
      const x3 = sx.invert(event.layerX);
      const new_x1 = Math.abs(x3 - x1) < Math.abs(x3 - x2) ? x3 : x1;
      const new_x2 = Math.abs(x3 - x1) < Math.abs(x3 - x2) ? x2 : x3;
      set_x_filter_bounds(j, new_x1, new_x2, sx);
    }, 300);
  });
  sliders_bg.on("click", function(event) {
    clearTimeout(timeout2);
    timeout2 = setTimeout(() => {
      const j = select_default2(this).datum();
      const sx = sxs[j];
      const fg = select_default2(sliders_fg.nodes()[j]);
      const x1 = sx.invert(+fg.attr("x1"));
      const x2 = sx.invert(+fg.attr("x2"));
      const x3 = sx.invert(event.layerX);
      const new_x1 = Math.abs(x3 - x1) < Math.abs(x3 - x2) ? x3 : x1;
      const new_x2 = Math.abs(x3 - x1) < Math.abs(x3 - x2) ? x2 : x3;
      set_x_filter_bounds(j, new_x1, new_x2, sx);
    }, 300);
  });
  function reset_x_bounds(node) {
    const j = select_default2(node).datum();
    const sx = sxs[j];
    set_x_filter_bounds(j, sx.domain()[0], sx.domain()[1], sx);
  }
  sliders_fg.on("dblclick", function() {
    clearTimeout(timeout2);
    reset_x_bounds(this);
  });
  sliders_bg.on("dblclick", function() {
    clearTimeout(timeout2);
    reset_x_bounds(this);
  });
  sliders_fg.call(
    drag_default().on("drag", function(event) {
      const j = select_default2(this).datum();
      const sx = sxs[j];
      const dx = sx.invert(event.dx) - sx.invert(0);
      const me = select_default2(this);
      const x1 = sx.invert(+me.attr("x1"));
      const x2 = sx.invert(+me.attr("x2"));
      const domain = sx.domain();
      const dxBound = clip(dx, domain[0] - x1, domain[1] - x2);
      set_x_filter_bounds(j, x1 + dxBound, x2 + dxBound, sx);
    })
  );
}
function draw_side_sliders(svg, splom, model) {
  const subplots = splom.subplots;
  const n_rows = subplots.length;
  const control_size = 12;
  const x_offset = 60;
  const y_offsets = cumulative_sum(subplots.map((row) => row[0].plot_height));
  const total_height = y_offsets[y_offsets.length - 1];
  const sys = subplots.map((row) => row[0].scales.sy);
  const fmt = format(".3~g");
  const g = svg.selectAll("g.side-slider").data(range(n_rows)).join("g").attr("class", "side-slider").attr("transform", (i) => `translate(0, ${total_height - y_offsets[i]})`);
  const label_min = g.append("text").attr("class", "side-range-min").attr("x", x_offset - 60).attr("text-anchor", "start").style("font", "10px sans-serif").style("pointer-events", "none").style("paint-order", "stroke").style("stroke", "white").style("stroke-width", 2).style("stroke-linejoin", "round");
  const label_max = g.append("text").attr("class", "side-range-max").attr("x", x_offset - 60).attr("text-anchor", "start").style("font", "10px sans-serif").style("pointer-events", "none").style("paint-order", "stroke").style("stroke", "white").style("stroke-width", 2).style("stroke-linejoin", "round");
  const sliders_bg = g.append("line").attr("class", "slider-bg").attr("stroke", "#aaa").attr("stroke-width", control_size * 0.6).attr("y1", (i) => sys[i](sys[i].domain()[0])).attr("y2", (i) => sys[i](sys[i].domain()[1])).attr("x1", x_offset).attr("x2", x_offset);
  const sliders_fg = g.append("line").attr("class", "side-slider-fg").attr("stroke", C[0]).attr("stroke-width", control_size * 0.6).attr("y1", (i) => sys[i](sys[i].domain()[0])).attr("y2", (i) => sys[i](sys[i].domain()[1])).attr("x1", x_offset).attr("x2", x_offset);
  const ctl_min = g.append("circle").attr("class", "slider-control-min").attr("cx", x_offset).attr("cy", (i) => sys[i](sys[i].domain()[0])).call(style_control, control_size);
  const ctl_max = g.append("circle").attr("class", "slider-control-max").attr("cx", x_offset).attr("cy", (i) => sys[i](sys[i].domain()[1])).call(style_control, control_size);
  g.append("g").attr("class", "slider-axis").attr("transform", `translate(${x_offset - control_size / 2}, 0)`).style("z-index", 2).each(function(i) {
    const ticks2 = subplots[i][0].frame.yticks;
    const ay = axisLeft(sys[i]).ticks(ticks2).tickFormat(format(".3s")).tickSizeInner(-control_size);
    const axis2 = select_default2(this).call(ay);
    axis2.selectAll("path.domain").remove();
    axis2.selectAll("g.tick line").attr("stroke", "#eee");
  });
  g.append("text").attr("y", (i) => mean(sys[i].range())).attr("x", x_offset + 20).attr(
    "transform",
    (i) => `rotate(-90 ${x_offset + 20} ${mean(sys[i].range())})`
  ).style("text-anchor", "middle").text((i) => splom.row_attrs[i]);
  function set_y_filter_bounds(i, lower2, upper, sy) {
    select_default2(ctl_min.nodes()[i]).attr("cy", sy(lower2));
    select_default2(ctl_max.nodes()[i]).attr("cy", sy(upper));
    select_default2(sliders_fg.nodes()[i]).attr("y1", sy(lower2)).attr("y2", sy(upper));
    label_min.attr("y", (ii, idx) => idx === i ? sy(lower2) + 3 : null).text((ii, idx) => idx === i ? fmt(lower2) : null);
    label_max.attr("y", (ii, idx) => idx === i ? sy(upper) + 3 : null).text((ii, idx) => idx === i ? fmt(upper) : null);
    const dim = splom.dimensions[splom.row_attrs[i]];
    dim.filter([lower2, upper]);
    splom.highlight_brushed_2(
      splom.data,
      subplots[0][0].scales.sc,
      splom.cross,
      splom.subplots,
      splom.row_attrs,
      splom.col_attrs
    );
    model.set(
      "selected",
      splom.data.map((d) => d.brushed)
    );
    model.set(
      "dists",
      splom.data.map((d) => d.dist)
    );
    model.save_changes();
  }
  ctl_min.call(
    drag_default().on("drag", function(event) {
      const i = select_default2(this).datum();
      const sy = sys[i];
      const domain = sy.domain();
      const y2 = sy.invert(event.y);
      const y_upper = sy.invert(+select_default2(ctl_max.nodes()[i]).attr("cy"));
      const y_lower = clip(
        y2,
        domain[0],
        y_upper - (domain[1] - domain[0]) * 0.05
      );
      set_y_filter_bounds(i, y_lower, y_upper, sy);
    })
  );
  ctl_max.call(
    drag_default().on("drag", function(event) {
      const i = select_default2(this).datum();
      const sy = sys[i];
      const domain = sy.domain();
      const y2 = sy.invert(event.y);
      const y_lower = sy.invert(+select_default2(ctl_min.nodes()[i]).attr("cy"));
      const y_upper = clip(
        y2,
        y_lower + (domain[1] - domain[0]) * 0.05,
        domain[1]
      );
      set_y_filter_bounds(i, y_lower, y_upper, sy);
    })
  );
  let timeout2 = null;
  sliders_fg.on("click", function(event) {
    clearTimeout(timeout2);
    timeout2 = setTimeout(() => {
      const me = select_default2(this);
      const i = me.datum();
      const sy = sys[i];
      const y1 = sy.invert(+me.attr("y1"));
      const y2 = sy.invert(+me.attr("y2"));
      const y3 = sy.invert(event.layerY);
      const new_y1 = Math.abs(y3 - y1) < Math.abs(y3 - y2) ? y3 : y1;
      const new_y2 = Math.abs(y3 - y1) < Math.abs(y3 - y2) ? y2 : y3;
      set_y_filter_bounds(i, new_y1, new_y2, sy);
    }, 300);
  });
  sliders_bg.on("click", function(event) {
    clearTimeout(timeout2);
    timeout2 = setTimeout(() => {
      const i = select_default2(this).datum();
      const sy = sys[i];
      const fg = select_default2(sliders_fg.nodes()[i]);
      const y1 = sy.invert(+fg.attr("y1"));
      const y2 = sy.invert(+fg.attr("y2"));
      const y3 = sy.invert(event.layerY);
      const new_y1 = Math.abs(y3 - y1) < Math.abs(y3 - y2) ? y3 : y1;
      const new_y2 = Math.abs(y3 - y1) < Math.abs(y3 - y2) ? y2 : y3;
      set_y_filter_bounds(i, new_y1, new_y2, sy);
    }, 300);
  });
  function reset_y_bounds(node) {
    const i = select_default2(node).datum();
    const sy = sys[i];
    set_y_filter_bounds(i, sy.domain()[0], sy.domain()[1], sy);
  }
  sliders_fg.on("dblclick", function() {
    clearTimeout(timeout2);
    reset_y_bounds(this);
  });
  sliders_bg.on("dblclick", function() {
    clearTimeout(timeout2);
    reset_y_bounds(this);
  });
  sliders_fg.call(
    drag_default().on("drag", function(event) {
      const i = select_default2(this).datum();
      const sy = sys[i];
      const dy = sy.invert(event.dy) - sy.invert(0);
      const me = select_default2(this);
      const y1 = sy.invert(+me.attr("y1"));
      const y2 = sy.invert(+me.attr("y2"));
      const domain = sy.domain();
      const dyBound = clip(dy, domain[0] - y1, domain[1] - y2);
      set_y_filter_bounds(i, y1 + dyBound, y2 + dyBound, sy);
    })
  );
}
var mywidget_default = { render };
export {
  mywidget_default as default
};
