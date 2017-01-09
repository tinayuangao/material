describe('md-input-container animations', function() {
  var $rootScope, $compile, $material, $window,
    el, pageScope, computedStyle;

  // Load our modules
  beforeEach(module('ngAnimate', 'ngMessages', 'material.components.input', 'material.components.checkbox'));

  // Run pre-test setup
  beforeEach(injectGlobals);
  beforeEach(setupVariables);

  // Run after-test teardown
  afterEach(teardown);

  it('set the proper styles when showing messages on an input', function() {
    compile(
      '<form name="testForm">' +
      '  <md-input-container>' +
      '    <input name="foo" ng-model="foo" required ng-pattern="/^1234$/" />' +
      '    <div class="errors" ng-messages="testForm.foo.$error">' +
      '      <div ng-message="required" style="transition:0s none">required</div>' +
      '      <div ng-message="pattern" style="transition:0s none">pattern</div>' +
      '    </div>' +
      '  </md-input-container>' +
      '</form>'
    );

    var container = el.find('md-input-container'),
      input = el.find('input');

    // Mimic the real validations/animations that fire

    /*
     * 1. Set to an invalid pattern but don't blur (so it's not invalid yet)
     *
     * Expect nothing to happen (message is hidden)
     */

    setFoo('asdf');
    flush();

    expectError(getError(), 'pattern');
    expect(container).not.toHaveClass('md-input-invalid');

    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(0); // not visible
    expect(parseInt(computedStyle.marginTop)).toBeLessThan(0);

    /*
     * 2. Blur the input, which adds the md-input-invalid class
     *
     * Expect to animate in the pattern message
     */

    input.triggerHandler('blur');
    flush();

    expectError(getError(), 'pattern');
    expect(container).toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(1); // visisble
    expect(parseInt(computedStyle.marginTop)).toEqual(0);

    /*
     * 3. Clear the field
     *
     * Expect to animate away pattern message and animate in the required message
     */

    setFoo('');
    expectError(getError(), 'required');
    flush();

    expect(container).toHaveClass('md-input-invalid');
    
    // Expect required messsage to be visible
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(1);
    expect(parseInt(computedStyle.marginTop)).toEqual(0);

    // Expect pattern messsage to not be visible
    expect(getError()[1]).toBeUndefined();

  });

  it('set the proper styles when showing messages on an md-checkbox', function() {
    compile(
      '<form name="testForm">' +
      '  <md-input-container>' +
      '    <md-checkbox name="cb" ng-model="foo" required>Test</md-checkbox>' +
      '    <div class="errors" ng-messages="testForm.cb.$error">' +
      '      <div ng-message="required" style="transition:0s none">required</div>' +
      '    </div>' +
      '  </md-input-container>' +
      '</form>'
    );

    var container = el.find('md-input-container'),
      checkbox = el.find('md-checkbox'),
      doneSpy = jasmine.createSpy('done');

    // Mimic the real validations/animations that fire

    /*
     * 1. Uncheck the checkbox but don't blur (so it's not invalid yet)
     *
     * Expect nothing to happen ($animateCss called with no options)
     */

    setFoo(true);
    checkbox.triggerHandler('click');
    flush();

    expectError(getError(), 'required');
    expect(container).not.toHaveClass('md-input-invalid');
    
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(0); // not visible
    expect(parseInt(computedStyle.marginTop)).toBeLessThan(0);

    /*
     * 2. Blur the checkbox, which adds the md-input-invalid class
     *
     * Expect to animate in the required message
     */

    checkbox.triggerHandler('blur');
    flush();

    expectError(getError(), 'required');
    expect(container).toHaveClass('md-input-invalid');
    computedStyle = $window.getComputedStyle(getError()[0]);
    expect(parseInt(computedStyle.opacity)).toEqual(1); // visisble
    expect(parseInt(computedStyle.marginTop)).toEqual(0);

    /*
     * 3. Clear the field
     *
     * Expect to animate away required message
     */

    setFoo(true);
    flush();

    expect(getError()[0]).toBeUndefined();

  });

  /*
   * Test Helper Functions
   */

  function compile(template) {
    el = $compile(template)(pageScope);
    angular.element(document.body).append(el);

    pageScope.$apply();

    return el;
  }

  function setFoo(value) {
    pageScope.foo = value;
    pageScope.$digest();
  }

  function getError() {
    return angular.element(el[0].querySelector('.errors div'));
  }

  function expectError(element, message) {
    expect(element.text().trim()).toBe(message);
  }

  function flush() {
    // Note: we use flushInterimElement() because it actually calls everything 3 times which seems
    // to be enough to actually flush the animations
    $material.flushInterimElement();
  }

  /*
   * before/afterEach Helper Functions
   */

  // Setup/grab our variables
  function injectGlobals() {
    inject(function($injector) {
      $rootScope = $injector.get('$rootScope');
      $compile = $injector.get('$compile');
      $material = $injector.get('$material');
      $window = $injector.get('$window');
    });
  }

  // Setup some custom variables for these tests
  function setupVariables() {
    pageScope = $rootScope.$new();
  }

  // Teardown our tests by resetting variables and removing our element
  function teardown() {
    el && el.remove && el.remove();
  }
});
