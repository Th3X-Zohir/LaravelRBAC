<?php

test('login page is available', function () {
    $response = $this->get(route('login'));

    $response->assertOk();
});
