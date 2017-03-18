import isFunction from 'lodash.isfunction';
import isArray    from 'lodash.isarray';
import verify     from '../util/verify';

/*
 * NOTE: This discussion is broader scoped than PatchableHOF class, and
 *       is intended to seed the User Guide of a (soon to be published)
 *       astx-patch utility.
 * 
 * PatchableHOF is a "helper" class that allows the authors of Higher
 * Order Function (HOF) to make their utility "patchable".  With the help
 * of this utility, HOF consumers can globally inject additional logic
 * into the HOF.
 *
 * 
 * Monkey Patching
 * ===============
 * 
 * This employs a technique called "monkey patching" ... which is the
 * ability to alter the characteristics of an external component:
 * 
 *   - globally ... in the sense that the external component itself
 *     "appears to" promote the enhancement out-of-the-box, without the
 *     need to layer it in another wrapper
 * 
 *   - and without access to the internal implementation of the component
 * 
 * Patching is commonly used in in cross-cutting concerns ... such as
 * logging, or timing, etc.  This is natural, as it can really only
 * apply logic before/after the invocation of the original function.
 * 
 * Patching is considered by some as an anti-pattern, in that it can
 * be abused in altering behavior, and even bypassing the original
 * function altogether.  
 *
 * 
 * Patching Objects
 * ================
 * 
 * Typically, in JavaScript, patching is associated to class methods.
 * 
 * Because methods are cataloged within the class's prototype, it
 * provides a central place to inject patches that globally alters the
 * behavior of all object instances of that class.
 * 
 * As a result, patching of objects can be accomplished without any
 * "extension hook" being provided by the external component.
 * 
 * 
 * Patchable Functions
 * ===================
 * 
 * That however is not the case with functional utilities.  There is no
 * out-of-the-box way to globally patch a function.  Of course you can
 * promote a utility wrapper, but that is not global (i.e. you must use a
 * different "wrapped" utility).
 * 
 * In order for functional utilities to be "patchable", the author must
 * provide a hook that defines a "functional catalog" which can be
 * reset/patched.  This provides the same "patchable" characteristic of
 * the class prototype ... that is an extra level of indirection where
 * the function is cataloged, and re-cataloged to apply patches.
 * 
 * That is what the patchableFn() astx-patch utility accomplishes.  It
 * publicly exposes a "patchable" API on the exposed function.
 * 
 *   AI: expand this when it is written (similar to Patchable HOFs - below).
 * 
 * 
 * Patchable HOFs
 * ==============
 * 
 * HOFs add yet another twist to the equation ... that is: how do you
 * globally patch the functions that are created/exposed from the HOF?
 * 
 * That is where PatchableHOF comes in.  Specifically, PatchableHOF
 * exposes a "patching" API on the HOF "creator" function, that
 * dynamically patches the HOF "created" functions (i.e. the functions
 * that the HOF creates/exposes).  In essence, this provides the ability
 * for a patch to be applied to a series of functions (all functions
 * created/exposed by an HOF).
 * 
 * PatchableHOF Usage (Consumer):
 * =============================
 * 
 * The HOF "patching" API is publicly available to the HOF consumer by
 * injecting it directly on the HOF creatorFn (as properties of the
 * creatorFn itself), and includes:
 * 
 *  + hof.patchCreatedFns(newImpl): patchId
 *        WHERE:
 *          - newImpl(priorImpl, ...args): *
 *            ... a function implementing the patch, supplied:
 *                  - priorImpl ... a function representing the prior implementation
 *                                  (typically invoked in newImpl)
 *                  - args ........ the run-time arguments supplied to the createdFn
 *          - return  ............. a patchId that can be used to selectively clear patches
 *        NOTE:
 *          - Patches are applied to ALL createdFns regardless of when
 *            they were created.  In other words, an injected patch
 *            impacts functions created in the past and future.
 * 
 *  + hof.patchCreatedFnsClear([patchId]): boolean
 *         WHERE:
 *          - patchId ............. the optional patchId to clear
 *                                  - can be an array of patchIds
 *                                  - if omitted, clears ALL patches
 *          - return  ............. a boolean indicator
 *                                  - true:  successful clear
 *                                  - false: patchId NOT found
 *        NOTE:
 *          - Patches are cleared in such a way as then never
 *            existed. In other words, a mid-stream patch that is
 *            removed (say 2 out of 3) will cause the 3rd patch to
 *            reference the 1st patches priorImpl.
 * 
 * 
 * PatchableHOF Usage (Author):
 * ===========================
 * 
 * As mentioned earlier, PatchableHOF is a "helper" class that allows
 * HOF authors to make their utility "patchable".
 * 
 * For each HOF:
 *   - a PatchableHOF instance should be created.
 *     ... this holds the necessary state to apply patches to the HOF
 *   - the HOF creator function should be registered via:
 *       patchableHOF.defineCreator(...)
 * 
 * Each function that is created/exposed by the HOF, should pass through
 * (i.e. registered) as follows:
 *   patchableHOF.defineCreated(...)
 * 
 * ?? provide example
 * 
 * Features
 * ========
 * 
 * Features of astx-patch include:
 *
 *  - multiple patches are supported by using a function chaining process
 *  - patch clear is supported (selective or all)
 */
export default class PatchableHOF {

  /**
   * Construct a new PatchableHOF instance, used by authors to
   * make their HOF creator functions "patchable".
   */
  constructor() {

    // carve out our instance variables ...

    // next patch identifier
    this._nextPatchId = 1;

    // array of patches registered via patchCreatedFns()
    // ... NOTE: This is the "raw" patches, WITHOUT any createdFn applied.
    //           The createdFn is applied in the _rootedStackCache.
    // ... STRUCTURE:
    //       [
    //         {
    //           patchId: unique-identifier-for-this-patch,
    //           newImpl: (priorImpl, ...args): *
    //         },
    //         ...
    //       ]
    this._patches = [];

    // cache of fully resolved stack chain patches for EACH of our registered createdFn
    // ... keyed by createdFn.sym (a Symbol uniquely identifying rootFn)
    // ... STRUCTURE:
    //       _rootedStackCache[createdFn.sym]: (...args) => {funct-with-back-refs to priorImpl}
    this._rootedStackCache = {};
  }


  /**
   * Augments the supplied HOF creatorFn with the publicly
   * accessible "patching" functions (see class description),
   * cataloged as properties of the creatorFn itself.
   *
   * This method should be invoked one time by the HOF, to make it's
   * "created" functions "patchable".  
   *
   * NOTE: Ideally, this method could be automatically supplied in our
   * constructor, however the HOF implementation needs to access the
   * defineCreated() method (hence the reason for this method).  In
   * addition, it is possible that multiple HOF's could utilize the
   * same set of patches (another reason for breaking this out into a
   * separate method).
   *
   * @param {function} creatorFn the HOF creatorFn to augment.
   *
   * @returns {function} the supplied creatorFn, augmented with the
   * "patching" functions (see class description).
   */
  defineCreator(creatorFn) {

    // validate params
    const check = verify.prefix('PatchableHOF.defineCreator() parameter violation: ');
    check(creatorFn,             'creatorFn argument is required');
    check(isFunction(creatorFn), 'creatorFn argument is NOT a function');

    // augment the supplied creatorFn ... see class doc (above)
    creatorFn.patchCreatedFns = (newImpl) => {
      const patchId = `patchId_${this._nextPatchId++}`;
      this._patches.push({ patchId, newImpl });
      this._rootedStackCache = {}; // clear our rootedStackCache, allowing it to be re-built with new patch
      return patchId;
    };
    creatorFn.patchCreatedFnsClear = (patchId) => {
      const patchIds = !patchId 
                         ? this._patches.map((patch)=>patch.patchId)
                         : (isArray(patchId) ? patchId : [patchId]);
      let success = true;
      for (const patchId of patchIds) {
        const removeIndx = this._patches.findIndex( (patch) => patch.patchId===patchId);
        if (removeIndx === -1) {
          success = false;
        }
        else {
          this._patches.splice(removeIndx, 1); // remove entry
        }
      }
      // clear our rootedStackCache, allowing it to be re-built without the removed patch(s)
      // ... do this 100% because it may be a partial success (i.e. some entries removed)
      this._rootedStackCache = {};
      return success;
    };

    // that's all folks :-)
    return creatorFn;
  }


  /**
   * Defines one of many "created" functions from the HOF creator, by
   * providing an extra level of indirection which applys the patches
   * cataloged in self (i.e. the HOF).
   *
   * This method should be invoked each time the HOF creates/exposes a
   * new "created" function.
   *
   * @param {function} createdFn the original createdFn which to be
   * patched (sometimes referred to as the rootFn).
   *
   * @returns {function} a newly wrapped function that applies the
   * cataloged HOF patches.
   */
  defineCreated(createdFn) {

    // validate params
    const check = verify.prefix('PatchableHOF.defineCreated() parameter violation: ');
    check(createdFn,             'createdFn argument is required');
    check(isFunction(createdFn), 'createdFn argument is NOT a function');

    // register a Symbol, which uniquely identifies this fn occurance
    createdFn.sym = Symbol();

    // return a "wrapped" createdFn, that dynamically applies registered patches at run-time
    return (...args) => applyPatch(this, createdFn, ...args);
  }

}


/**
 * Internal method that executes (at run-time) the supplied rootFn,
 * dynamically applying self's patches.
 *
 * @param {PatchableHOF} hofHelper the patchableHOF instance to operate
 * against.
 * @param {function} rootFn the base function to execute, and apply
 * patches to.
 * @param {...args} run-time arguments passed to rootFn.
 *
 * @returns {*} the result of rootFn invocation, with applied
 * patches.
 *
 * @private
 */
function applyPatch(hofHelper, rootFn, ...args) {

  // NOTE: A unique function indentifier should be cataloged on rootFn.sym.
  //       This is used internally as a caching optimization.
  //       This should not be a problem because it is maintained internally.
  //       Because applyPatch() has now been moved into a TOTALLY private function,
  //       ... this verification is NO LONGER required.
  // verify(rootFn.sym, 'PatchableHOF.applyPatch() expecting rootFn.sym to uniquely identify this function');

  // locate our rootedStackCache, dynamically create/catalog on first usage
  let rootedStackCache = hofHelper._rootedStackCache[rootFn.sym];
  if (!rootedStackCache) {
    // build up our entire stack chain of patches (seeded with the supplied rootFn)
    rootedStackCache = hofHelper._rootedStackCache[rootFn.sym] = 
    hofHelper._patches.reduce( (priorImpl, patch) => (...args) => patch.newImpl(priorImpl, ...args),
                               rootFn);
    // console.log('CREATING CACHE (PatchableHOF.applyPatch() crude VISUAL optimization check)');
  }
  // else {
  //   console.log('USING CACHE (PatchableHOF.applyPatch() crude VISUAL optimization check)');
  // }

  // indirectly invoke the supplied rootFn, after applying any registered patches
  return rootedStackCache(...args);
}
