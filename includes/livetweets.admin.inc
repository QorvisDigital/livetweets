<?php

/*
 * @file
 * contains the form api callback for the administration form
 */

 /*
  * returns the administration form
  */
 function livetweets_admin(){
   $form = array();
   
   $form['livetweets_update_interval'] = array(
    '#type' => 'textfield',
    '#default_value' => variable_get('livetweets_update_interval', 5000),
    '#title' => t('Update Interval'),
    '#description' => t('Amount of time in milleseconds to wait in between api calls.'),
   );
   
   $form['livetweets_blocks_count'] = array(
    '#type' => 'textfield',
    '#default_value' => variable_get('livetweets_blocks_count', 1),
    '#title' => t('LiveTweets Blocks Available'),
    '#description' => t('Number of blocks to generate.'),
   );
   
   $form['#validate'][] = 'livetweets_admin_validate';
   
   return system_settings_form($form);
 }
 
 /*
  * validates the admin form
  * implementation of hook_form_validate
  */
 function livetweets_admin_validate($form, &$form_state){
   // validate update interval
   if(
    !is_numeric($form_state['values']['livetweets_update_interval']) 
    || intval($form_state['values']['livetweets_update_interval']) != $form_state['values']['livetweets_update_interval']
    || $form_state['values']['livetweets_update_interval'] > 5000
   ){
     form_set_error('livetweets_update_interval', t('This value must be an integer greater than 5000'));
   }
   
   // validate blocks count
   if(
    !is_numeric($form_state['values']['livetweets_blocks_count'])
    || intval($form_state['values']['livetweets_blocks_count']) != $form_state['values']['livetweets_blocks_count']
    || $form_state['values']['livetweets_blocks_count'] > 100
    || $form_state['values']['livetweets_blocks_count'] < 1
   ){
     form_set_error('livetweets_blocks_count',t('This value must be an integer in between 1 and 100'));
   }
 }
 
