#!/usr/bin/env ruby

require 'liquid'

module Jekyll
  class BrowserInfoTag < Liquid::Tag
    def render(context)
      browser_info = "Browser: " + context.registers[:site].config['browser'] + ", Device: " + context.registers[:site].config['device']
      browser_info
    end
  end
end

Liquid::Template.register_tag('browser_info', Jekyll::BrowserInfoTag)
