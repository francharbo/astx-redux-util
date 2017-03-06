import moduleFromDevSrc    from '../index';
import moduleFromBundle    from '../../dist/astx-redux-util';
import moduleFromBundleMin from '../../dist/astx-redux-util.min';
import moduleFromLib       from '../../lib/index';
import moduleFromEs        from '../../es/index';

/*
 * This export module allows our unit tests to dynamically reference
 * different module platforms (i.e. the JS module ecosystem), which
 * will eventually be published to npm.
 * 
 * It should be used by ALL our unit tests (as opposed to directly
 * importing the module from src).
 * 
 * It exports the module under test, as controlled by the MODULE_PLATFORM
 * environment variable. Supported platforms (JS module ecosystems) are:
 *                                                                      
 *   MODULE_PLATFORM  What                 Bindings  Found In               NOTES
 *   ===============  ===================  ========  =====================  ==================================
 *   src              master ES6 source    ES        src/*.js               DEFAULT (when platform is omitted)
 *   bundle           bundled ES5          CommonJS  dist/{project}.js
 *   bundle.min       bundled/minified ES5 CommonJS  dist/{project}.min.js
 *   lib              ES5 source           CommonJS  lib/*.js
 *   es               ES5 source           ES        es/*.js
 *   all              all of the above                                      APPLICABLE to npm scripts ONLY
 * 
 * NOTE: Due to the static nature of ES6 imports, this is the closest
 *       thing we can get to dynamic imports!
 * 
 *       We basically import ALL variations (see above) and dynamically
 *       promote just one of them.
 * 
 *       The only QUIRKY thing about this technique, is that all platforms
 *       must pre-exist, even to test just one of them ... because the
 *       static import (above) will fail!
 * 
 *       As it turns out, this is NOT that big a deal, as all you have to
 *       do is (especially after an "npm run clean"):
 *         $ npm run build:all
 */


//***
//*** dynamically define our moduleUnderTest (dynamically driven from the MODULE_PLATFORM env var)
//***

const { MODULE_PLATFORM } = process.env;

let moduleUnderTest = moduleFromDevSrc;

switch (MODULE_PLATFORM) {
  case 'src':
  case undefined:
    console.log(`*** Testing Module Platform found in: src/*.js (MODULE_PLATFORM: ${MODULE_PLATFORM})`); // eslint-disable-line no-console
    moduleUnderTest = moduleFromDevSrc;
    break;
  case 'bundle':  
    console.log(`*** Testing Module Platform found in: dist/astx-redux-util.js (MODULE_PLATFORM: ${MODULE_PLATFORM})`); // eslint-disable-line no-console
    moduleUnderTest = moduleFromBundle;
    break;
  case 'bundle.min':  
    console.log(`*** Testing Module Platform found in: dist/astx-redux-util.min.js (MODULE_PLATFORM: ${MODULE_PLATFORM})`); // eslint-disable-line no-console
    moduleUnderTest = moduleFromBundleMin;
    break;
  case 'lib':  
    console.log(`*** Testing Module Platform found in: lib/index.js (MODULE_PLATFORM: ${MODULE_PLATFORM})`); // eslint-disable-line no-console
    moduleUnderTest = moduleFromLib;
    break;
  case 'es':  
    console.log(`*** Testing Module Platform found in: es/index.js (MODULE_PLATFORM: ${MODULE_PLATFORM})`); // eslint-disable-line no-console
    moduleUnderTest = moduleFromEs;
    break;
  default:
    throw new Error(`*** ERROR *** moduleUnderTest(): Unrecognized MODULE_PLATFORM environment variable value: ${MODULE_PLATFORM}`);
}

export default moduleUnderTest;
