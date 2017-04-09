
<br/><br/><br/>

<a id="conditionalReducer"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  conditionalReducer(conditionalFn, thenReducerFn, [elseReducerFn], [initialState]) ⇒ [`reducerFn`](#reducerFn)</h5>
Create a higher-order reducer that conditionally executes one of


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| conditionalFn | [`conditionalReducerCB`](#conditionalReducerCB) |  | a callback function whose return value determines which reducerFn is executed ... truthy: thenReducerFn(), falsy: elseReducerFn(). |
| thenReducerFn | [`reducerFn`](#reducerFn) |  | the "wrapped" reducer invoked when conditionalFn returns truthy. |
| [elseReducerFn] | [`reducerFn`](#reducerFn) | <code>identity</code> | the optional "wrapped" reducer invoked when conditionalFn returns falsy.  DEFAULT: [identity function](https://lodash.com/docs#identity) |
| [initialState] | [`InitialState`](#InitialState) |  | the optional fall-back state value used during the state initialization boot-strap process. |

**Returns**: [`reducerFn`](#reducerFn) - a newly created reducer function (described above).  

<br/><br/><br/>

<a id="joinReducers"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  joinReducers(...reducerFns, [initialState]) ⇒ [`reducerFn`](#reducerFn)</h5>
Create a higher-order reducer by combining two or more reducers,


| Param | Type | Description |
| --- | --- | --- |
| ...reducerFns | [`reducerFn`](#reducerFn) | two or more reducer functions to join together. |
| [initialState] | [`InitialState`](#InitialState) | the optional fall-back state value used during the state initialization boot-strap process. |

**Returns**: [`reducerFn`](#reducerFn) - a newly created reducer function (described above).  

<br/><br/><br/>

<a id="reducerHash"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  reducerHash(actionHandlers, [initialState]) ⇒ [`reducerFn`](#reducerFn)</h5>
Create a higher-order reducer by combining a set of sub-reducer


| Param | Type | Description |
| --- | --- | --- |
| actionHandlers | [`ActionReducerHash`](#ActionReducerHash) | a hash of reducer functions, indexed by the standard redux action.type. |
| [initialState] | [`InitialState`](#InitialState) | the optional fall-back state value used during the state initialization boot-strap process. |

**Returns**: [`reducerFn`](#reducerFn) - a newly created reducer function (described above).  

<br/><br/><br/>

<a id="conditionalReducerCB"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  conditionalReducerCB ⇒ truthy</h5>
A callback function (used in {{book.api.conditionalReducer}}) whose


| Param | Type | Description |
| --- | --- | --- |
| state | \* | The current immutable state that is the reduction target. |
| action | [`Action`](#Action) | The standard redux Action object that drives the reduction process. |
| originalReducerState | \* | The immutable state at the time of the start of the reduction process. This is useful in determining whether state has changed within a series of reductions {{book.api.joinReducers}} ... because each individual reducer only has visibility of the state within it's own reduction process. Further information can be found in the {{book.guide.originalReducerState}} discussion of the Dev Guide. |

**Returns**: truthy - A truthy value indicating which reducerFn is

<br/><br/><br/>

<a id="ActionReducerHash"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  ActionReducerHash : Object</h5>
A hash of reducer functions, indexed by the standard redux

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| actionType1 | [`reducerFn`](#reducerFn) | The reducer function servicing: 'actionType1'. |
| actionType2 | [`reducerFn`](#reducerFn) | The reducer function servicing: 'actionType2'. |
| ...more | [`reducerFn`](#reducerFn) | ...etc. |


<br/><br/><br/>

<a id="reducerFn"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  reducerFn ⇒ \*</h5>
A standard [redux reducer function](http://redux.js.org/docs/basics/Reducers.html)


| Param | Type | Description |
| --- | --- | --- |
| state | \* | The current immutable state that is the reduction target. |
| action | [`Action`](#Action) | The standard redux action which drives the reduction process. |

**Returns**: \* - The resulting state after reduction.  

<br/><br/><br/>

<a id="Action"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  Action : Object</h5>
A standard [redux Action object](http://redux.js.org/docs/basics/Actions.html)

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | string | The action type. |
| whatever | \* | Additional app-specific payload (as needed). |


<br/><br/><br/>

<a id="InitialState"></a>

<h5 style="margin: 10px 0px; border-width: 5px 0px; padding: 5px; border-style: solid;">
  InitialState : \*</h5>
All astx-redux-util reducer creators, expose an `initialState`
